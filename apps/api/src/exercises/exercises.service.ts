import type {
  ExerciseAttemptDiagnostic,
  ExerciseAttemptRequest,
  ExerciseAttemptResponse,
  ExerciseReportRequest,
  ExerciseReportResponse,
  PreparedExerciseResponse,
} from '@language/contracts'
import {
  AttemptOutcome,
  ContentStatus,
  EvidenceResult,
  ExerciseItemRole,
  ExerciseKind,
  KnowledgeItemKind,
  Prisma,
} from '@language/database'
import {
  alignStructuredAnswerSlots,
  checkStructuredAnswer,
  recordReview,
  type StructuredAnswerDiagnostic,
  type StructuredAnswerSlot,
} from '@language/domain'
import type {
  FinnishFormComparison,
  FinnishMorphologicalDifference,
} from '@language/language-fi'
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '../database/prisma.service'
import { assertLessonAvailable } from '../common/lesson-access'
import {
  EXERCISE_CHECKER_VERSION,
  toPreparedAnswerSpec,
} from '../common/answer-spec'
import {
  initialUserMemoryData,
  toReviewMemorySnapshot,
  toUserMemoryData,
} from '../common/user-memory'
import { FinnishMorphologyService } from '../morphology/finnish-morphology.service'
import { MediaUrlService } from '../media/media-url.service'

interface StoredAnswerSpec {
  acceptedVariants: string[]
  slots: StructuredAnswerSlot[]
}

interface StoredAttempt {
  id: string
  exerciseId: string
  outcome: AttemptOutcome
  normalizedAnswerText: string
  diagnostics: unknown
  evidence: Array<{
    itemId: string
    role: ExerciseItemRole
    result: EvidenceResult
  }>
}

@Injectable()
export class ExercisesService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(FinnishMorphologyService)
    private readonly morphology: FinnishMorphologyService,
    @Inject(MediaUrlService) private readonly media: MediaUrlService,
  ) {}

  async getNextExercise(
    userId: string,
    routeVersionId: string,
    lessonId: string,
    sourceLanguage: string,
    excludedExerciseIds: string[],
  ): Promise<PreparedExerciseResponse> {
    if (!routeVersionId) {
      throw new BadRequestException('routeVersionId is required')
    }
    await assertLessonAvailable(this.prisma, userId, routeVersionId, lessonId)
    const candidates = await this.prisma.exercise.findMany({
      where: {
        lessonId,
        kind: ExerciseKind.PREPARED,
        status: ContentStatus.CURATED,
        prompts: { some: { sourceLanguage } },
        ...(excludedExerciseIds.length > 0
          ? { id: { notIn: excludedExerciseIds } }
          : {}),
      },
      include: {
        prompts: { where: { sourceLanguage }, take: 1 },
        items: {
          where: { role: { not: ExerciseItemRole.CONTEXT } },
          select: {
            itemId: true,
            item: { select: { kind: true } },
          },
        },
        audioAssets: {
          where: { variant: 'standard' },
          take: 1,
          include: { audioAsset: true },
        },
      },
    })
    const exercise = selectRandomCandidate(candidates)

    const prompt = exercise?.prompts[0]
    if (!exercise || !prompt) {
      throw new NotFoundException(
        `No exercise for lesson ${lessonId} and language ${sourceLanguage}`,
      )
    }

    await this.ensureExerciseMemories(userId, exercise.items)

    return {
      id: exercise.id,
      lessonId,
      sourceLanguage,
      targetLanguage: exercise.targetLanguage,
      prompt: prompt.text,
      audioUrl: this.media.resolve(exercise.audioAssets?.[0]?.audioAsset.url),
      answerSpec: toPreparedAnswerSpec(exercise.answerSpec),
      checkerVersion: EXERCISE_CHECKER_VERSION,
    }
  }

  async getExercise(
    userId: string,
    routeVersionId: string,
    lessonId: string,
    exerciseId: string,
    sourceLanguage: string,
  ): Promise<PreparedExerciseResponse> {
    if (!routeVersionId) {
      throw new BadRequestException('routeVersionId is required')
    }
    await assertLessonAvailable(this.prisma, userId, routeVersionId, lessonId)
    const exercise = await this.prisma.exercise.findFirst({
      where: {
        id: exerciseId,
        lessonId,
        kind: ExerciseKind.PREPARED,
        status: ContentStatus.CURATED,
        prompts: { some: { sourceLanguage } },
      },
      include: {
        prompts: { where: { sourceLanguage }, take: 1 },
        items: {
          where: { role: { not: ExerciseItemRole.CONTEXT } },
          select: {
            itemId: true,
            item: { select: { kind: true } },
          },
        },
        audioAssets: {
          where: { variant: 'standard' },
          take: 1,
          include: { audioAsset: true },
        },
      },
    })
    const prompt = exercise?.prompts[0]
    if (!exercise || !prompt) {
      throw new NotFoundException(
        `Exercise ${exerciseId} was not found in lesson ${lessonId}`,
      )
    }

    await this.ensureExerciseMemories(userId, exercise.items)

    return {
      id: exercise.id,
      lessonId,
      sourceLanguage,
      targetLanguage: exercise.targetLanguage,
      prompt: prompt.text,
      audioUrl: this.media.resolve(exercise.audioAssets?.[0]?.audioAsset.url),
      answerSpec: toPreparedAnswerSpec(exercise.answerSpec),
      checkerVersion: EXERCISE_CHECKER_VERSION,
    }
  }

  async submitAttempt(
    userId: string,
    exerciseId: string,
    request: ExerciseAttemptRequest,
  ): Promise<ExerciseAttemptResponse> {
    const existingAttempt = await this.findAttempt(
      userId,
      request.idempotencyKey,
    )
    if (existingAttempt) {
      return this.mapIdempotentAttempt(existingAttempt, exerciseId)
    }

    const exercise = await this.prisma.exercise.findFirst({
      where: {
        id: exerciseId,
        status: {
          in: [
            ContentStatus.GENERATED,
            ContentStatus.VERIFIED,
            ContentStatus.CURATED,
          ],
        },
      },
      include: {
        items: {
          include: { item: { select: { kind: true } } },
        },
        generated: { select: { generatorVersion: true } },
      },
    })
    if (!exercise) {
      throw new NotFoundException(`Exercise ${exerciseId} was not found`)
    }

    if (!exercise.lessonId) {
      throw new ConflictException('Exercise is not attached to a lesson')
    }

    const routeEntry = await this.prisma.courseRouteEntry.findFirst({
      where: {
        routeVersionId: request.routeVersionId,
        lessonId: exercise.lessonId,
        routeVersion: { status: ContentStatus.CURATED },
        lesson: { status: ContentStatus.CURATED },
      },
      select: { lessonId: true },
    })
    if (!routeEntry) {
      throw new NotFoundException(
        `Exercise ${exerciseId} is not part of route ${request.routeVersionId}`,
      )
    }
    await assertLessonAvailable(
      this.prisma,
      userId,
      request.routeVersionId,
      exercise.lessonId,
    )

    const answerSpec = toStoredAnswerSpec(exercise.answerSpec)
    const check = checkStructuredAnswer(request.answer, answerSpec)
    const comparisonCache = new Map<
      string,
      Promise<FinnishFormComparison | undefined>
    >()
    const compareForms = (actual: string, expected: string[]) => {
      const key = `${actual}\u0000${expected.join('\u0000')}`
      const cached = comparisonCache.get(key)
      if (cached) return cached
      const comparison = this.morphology.compareForms(actual, expected)
      comparisonCache.set(key, comparison)
      return comparison
    }
    const resultByItem = await evaluateStructuredEvidence(
      request.answer,
      answerSpec,
      exercise.items.map((item) => ({
        itemId: item.itemId,
        kind: item.item.kind,
      })),
      compareForms,
    )
    const outcome = check.isCorrect
      ? AttemptOutcome.CORRECT
      : AttemptOutcome.INCORRECT
    const diagnostics = await Promise.all(
      check.diagnostics.map(async (diagnostic) => {
        const comparison =
          (diagnostic.code === 'TYPO' || diagnostic.code === 'WRONG_FORM') &&
          diagnostic.actual &&
          diagnostic.expected?.length
            ? await compareForms(diagnostic.actual, diagnostic.expected)
            : undefined
        return toAttemptDiagnostic(diagnostic, comparison)
      }),
    )
    const evidence = exercise.items.map((item) => ({
      itemId: item.itemId,
      role: item.role,
      result:
        item.role === ExerciseItemRole.CONTEXT
          ? EvidenceResult.IGNORED
          : (resultByItem.get(item.itemId) ??
            (check.isCorrect
              ? EvidenceResult.SUCCESS
              : EvidenceResult.FAILURE)),
      score:
        item.role === ExerciseItemRole.CONTEXT
          ? null
          : (resultByItem.get(item.itemId) ??
                (check.isCorrect
                  ? EvidenceResult.SUCCESS
                  : EvidenceResult.FAILURE)) === EvidenceResult.SUCCESS
            ? 1
            : resultByItem.get(item.itemId) === EvidenceResult.IGNORED
              ? null
              : 0,
    }))
    await this.ensureExerciseMemories(userId, exercise.items)
    const now = new Date()

    try {
      const attempt = await this.prisma.$transaction(async (transaction) => {
        const created = await transaction.userAttempt.create({
          data: {
            userId,
            exerciseId,
            routeVersionId: request.routeVersionId,
            idempotencyKey: request.idempotencyKey,
            answerText: request.answer,
            normalizedAnswerText: check.normalizedAnswer,
            outcome,
            diagnostics: diagnostics as unknown as Prisma.InputJsonValue,
            checkerVersion: EXERCISE_CHECKER_VERSION,
            generatorVersion: exercise.generated?.generatorVersion,
            durationMs: request.durationMs,
            answeredAt: now,
          },
        })
        for (const itemEvidence of evidence) {
          await transaction.userAttemptEvidence.create({
            data: { attemptId: created.id, ...itemEvidence },
          })
        }

        for (const itemEvidence of evidence) {
          if (itemEvidence.result === EvidenceResult.IGNORED) {
            continue
          }

          const memory = await transaction.userMemory.findUnique({
            where: {
              userId_itemId: { userId, itemId: itemEvidence.itemId },
            },
          })

          if (!memory) {
            await transaction.userMemory.upsert({
              where: {
                userId_itemId: { userId, itemId: itemEvidence.itemId },
              },
              update: {},
              create: {
                userId,
                itemId: itemEvidence.itemId,
                ...initialUserMemoryData(now),
              },
            })
            continue
          }

          const review = recordReview(
            toReviewMemorySnapshot(memory),
            itemEvidence.result === EvidenceResult.SUCCESS
              ? 'SUCCESS'
              : 'FAILURE',
            now,
          )
          if (!review.wasScheduledReview) continue

          await transaction.userMemory.upsert({
            where: {
              userId_itemId: { userId, itemId: itemEvidence.itemId },
            },
            update: toUserMemoryData(review.memory),
            create: {
              userId,
              itemId: itemEvidence.itemId,
              ...toUserMemoryData(review.memory),
            },
          })
        }

        await transaction.userExerciseHistory.upsert({
          where: { userId_exerciseId: { userId, exerciseId } },
          update: {
            lastSeenAt: now,
            timesSeen: { increment: 1 },
            lastOutcome: outcome,
          },
          create: {
            userId,
            exerciseId,
            firstSeenAt: now,
            lastSeenAt: now,
            lastOutcome: outcome,
          },
        })

        return { ...created, evidence } as StoredAttempt
      })

      return toAttemptResponse(attempt)
    } catch (error: unknown) {
      if (isUniqueConstraintError(error)) {
        const concurrentAttempt = await this.findAttempt(
          userId,
          request.idempotencyKey,
        )
        if (concurrentAttempt) {
          return this.mapIdempotentAttempt(concurrentAttempt, exerciseId)
        }
      }

      throw error
    }
  }

  async reportExercise(
    userId: string,
    exerciseId: string,
    request: ExerciseReportRequest,
  ): Promise<ExerciseReportResponse> {
    const attempt = await this.prisma.userAttempt.findFirst({
      where: { id: request.attemptId, userId, exerciseId },
      select: { id: true },
    })
    if (!attempt) {
      throw new NotFoundException(
        `Attempt ${request.attemptId} was not found for exercise ${exerciseId}`,
      )
    }

    const comment = request.comment?.trim() || null
    const report = await this.prisma.exerciseReport.upsert({
      where: { attemptId: request.attemptId },
      update: {
        reason: request.reason,
        comment,
        status: 'NEW',
      },
      create: {
        userId,
        exerciseId,
        attemptId: request.attemptId,
        reason: request.reason,
        comment,
      },
    })

    return {
      id: report.id,
      exerciseId: report.exerciseId,
      attemptId: report.attemptId,
      reason: report.reason,
      comment: report.comment,
      status: report.status,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    }
  }

  private findAttempt(userId: string, idempotencyKey: string) {
    return this.prisma.userAttempt.findUnique({
      where: { userId_idempotencyKey: { userId, idempotencyKey } },
      include: { evidence: true },
    })
  }

  private mapIdempotentAttempt(
    attempt: StoredAttempt,
    exerciseId: string,
  ): ExerciseAttemptResponse {
    if (attempt.exerciseId !== exerciseId) {
      throw new ConflictException(
        'Idempotency key has already been used for another exercise',
      )
    }

    return toAttemptResponse(attempt)
  }

  private async ensureExerciseMemories(
    userId: string,
    items: Array<{ itemId: string; item: { kind: KnowledgeItemKind } }>,
  ): Promise<void> {
    const encounteredAt = new Date()
    await this.prisma.userMemory.createMany({
      data: items.map(({ itemId }) => ({
        userId,
        itemId,
        ...initialUserMemoryData(encounteredAt),
      })),
      skipDuplicates: true,
    })
  }
}

function toStoredAnswerSpec(value: unknown): StoredAnswerSpec {
  return toPreparedAnswerSpec(value)
}

async function evaluateStructuredEvidence(
  answer: string,
  spec: StoredAnswerSpec,
  items: Array<{ itemId: string; kind: KnowledgeItemKind }>,
  compareForms: (
    actual: string,
    expected: string[],
  ) => Promise<FinnishFormComparison | undefined>,
): Promise<Map<string, EvidenceResult>> {
  const alignment = alignStructuredAnswerSlots(answer, spec)
  if (alignment.isExact) {
    return new Map(
      items.map((item) => [item.itemId, EvidenceResult.SUCCESS] as const),
    )
  }

  const kindByItem = new Map(items.map((item) => [item.itemId, item.kind]))
  const resultsByItem = new Map<string, EvidenceResult[]>()
  const record = (itemId: string, result: EvidenceResult) => {
    const results = resultsByItem.get(itemId) ?? []
    results.push(result)
    resultsByItem.set(itemId, results)
  }

  for (const slot of alignment.slots) {
    const comparison =
      slot.result === 'SUBSTITUTE' && slot.actual
        ? await compareForms(slot.actual, slot.accepted)
        : undefined

    for (const itemId of slot.itemIds) {
      const kind = kindByItem.get(itemId)
      if (!kind) continue
      record(
        itemId,
        kind === KnowledgeItemKind.LEXICAL_SENSE
          ? lexicalEvidenceForSlot(slot.result, comparison)
          : grammarEvidenceForSlot(slot.result, comparison),
      )
    }
  }

  if (alignment.hasWordOrderError || alignment.extraTokens.length > 0) {
    for (const item of items) {
      if (
        item.kind !== KnowledgeItemKind.LEXICAL_SENSE &&
        resultsByItem.has(item.itemId)
      ) {
        record(item.itemId, EvidenceResult.FAILURE)
      }
    }
  }

  return new Map(
    items.flatMap((item) => {
      const results = resultsByItem.get(item.itemId)
      if (!results || results.length === 0) return []
      return [[item.itemId, combineEvidenceResults(results)] as const]
    }),
  )
}

function lexicalEvidenceForSlot(
  result: 'MATCH' | 'SUBSTITUTE' | 'MISSING',
  comparison: FinnishFormComparison | undefined,
): EvidenceResult {
  if (result === 'MATCH') return EvidenceResult.SUCCESS
  if (result === 'MISSING') return EvidenceResult.FAILURE
  return comparison?.relation === 'sameLemma'
    ? EvidenceResult.SUCCESS
    : EvidenceResult.FAILURE
}

function grammarEvidenceForSlot(
  result: 'MATCH' | 'SUBSTITUTE' | 'MISSING',
  comparison: FinnishFormComparison | undefined,
): EvidenceResult {
  if (result === 'MATCH') return EvidenceResult.SUCCESS
  if (result === 'MISSING') return EvidenceResult.FAILURE
  if (!comparison) return EvidenceResult.FAILURE
  if (comparison.relation === 'sameLemma') return EvidenceResult.FAILURE
  if (comparison.relation === 'differentLemma') {
    return hasSameMorphologicalShape(comparison)
      ? EvidenceResult.SUCCESS
      : EvidenceResult.FAILURE
  }
  return EvidenceResult.IGNORED
}

function hasSameMorphologicalShape(comparison: FinnishFormComparison) {
  const actual = comparison.actualAnalysis
  const expected = comparison.expectedAnalysis
  if (!actual || !expected || actual.partOfSpeech !== expected.partOfSpeech) {
    return false
  }

  const featureNames = new Set([
    ...Object.keys(actual.features),
    ...Object.keys(expected.features),
  ])
  return [...featureNames].every(
    (feature) =>
      actual.features[feature as keyof typeof actual.features] ===
      expected.features[feature as keyof typeof expected.features],
  )
}

function combineEvidenceResults(results: EvidenceResult[]): EvidenceResult {
  if (results.includes(EvidenceResult.FAILURE)) return EvidenceResult.FAILURE
  if (results.every((result) => result === EvidenceResult.SUCCESS)) {
    return EvidenceResult.SUCCESS
  }
  return EvidenceResult.IGNORED
}

function toAttemptDiagnostic(
  diagnostic: StructuredAnswerDiagnostic,
  comparison?: FinnishFormComparison,
): ExerciseAttemptDiagnostic {
  const expected = diagnostic.expected?.map((token) => `«${token}»`).join(' / ')

  if (diagnostic.code === 'EXACT_MATCH') {
    return {
      code: diagnostic.code,
      message: { ru: 'Верно! Все формы и порядок слов правильные.' },
    }
  }

  if (diagnostic.code === 'MISSING_TOKEN') {
    return {
      code: diagnostic.code,
      message: {
        ru: expected
          ? `В ответе не хватает элемента ${expected}.`
          : 'В ответе не хватает одного из элементов.',
      },
    }
  }

  if (diagnostic.code === 'EXTRA_TOKEN') {
    return {
      code: diagnostic.code,
      message: {
        ru: diagnostic.actual
          ? `В ответе есть лишнее слово «${diagnostic.actual}».`
          : 'В ответе есть лишнее слово.',
      },
    }
  }

  if (diagnostic.code === 'WORD_ORDER') {
    return {
      code: diagnostic.code,
      message: { ru: 'Все нужные слова есть, но проверь их порядок.' },
    }
  }

  if (diagnostic.code === 'TYPO') {
    if (comparison?.relation === 'sameLemma') {
      return wrongFormDiagnostic(diagnostic, expected, comparison)
    }
    if (comparison?.relation === 'differentLemma') {
      return wrongLemmaDiagnostic(diagnostic, expected, comparison)
    }
    return {
      code: diagnostic.code,
      message: {
        ru: `Похоже на опечатку в слове «${diagnostic.actual ?? '—'}»${expected ? `. Проверь написание: ${expected}` : ''}.`,
      },
      ...(comparison ? { morphology: toMorphologyDiagnostic(comparison) } : {}),
    }
  }

  if (diagnostic.code === 'WRONG_FORM') {
    if (comparison?.relation === 'spellingError') {
      return {
        code: 'TYPO',
        message: {
          ru: `Похоже на опечатку в слове «${diagnostic.actual ?? '—'}»${expected ? `. Проверь написание: ${expected}` : ''}.`,
        },
        morphology: toMorphologyDiagnostic(comparison),
      }
    }
    if (comparison?.relation === 'differentLemma') {
      return wrongLemmaDiagnostic(diagnostic, expected, comparison)
    }
    return wrongFormDiagnostic(diagnostic, expected, comparison)
  }

  return {
    code: 'ANSWER_MISMATCH',
    message: { ru: 'Пока не совпало. Проверь слова и их формы.' },
  }
}

function wrongFormDiagnostic(
  diagnostic: StructuredAnswerDiagnostic,
  expectedLabel: string | undefined,
  comparison: FinnishFormComparison | undefined,
): ExerciseAttemptDiagnostic {
  const explanation = comparison
    ? describeMorphologicalDifferences(comparison.differences)
    : ''
  return {
    code: 'WRONG_FORM',
    message: {
      ru: `Форма «${diagnostic.actual ?? '—'}» здесь не подходит${expectedLabel ? `. Ожидалось ${expectedLabel}` : ''}.${explanation ? ` ${explanation}` : ''}`,
    },
    ...(comparison ? { morphology: toMorphologyDiagnostic(comparison) } : {}),
  }
}

function wrongLemmaDiagnostic(
  diagnostic: StructuredAnswerDiagnostic,
  expectedLabel: string | undefined,
  comparison: FinnishFormComparison,
): ExerciseAttemptDiagnostic {
  const actualLemma = comparison.actualAnalysis?.lemma
  const expectedLemma = comparison.expectedAnalysis?.lemma
  return {
    code: 'WRONG_LEMMA',
    message: {
      ru: `Использовано другое слово «${diagnostic.actual ?? '—'}»${actualLemma ? ` (лемма «${actualLemma}»)` : ''}${expectedLabel ? `. Здесь нужно ${expectedLabel}` : ''}${expectedLemma ? ` — форма леммы «${expectedLemma}»` : ''}.`,
    },
    morphology: toMorphologyDiagnostic(comparison),
  }
}

function toMorphologyDiagnostic(
  comparison: FinnishFormComparison,
): NonNullable<ExerciseAttemptDiagnostic['morphology']> {
  return {
    relation:
      comparison.relation === 'sameForm' ? 'unknown' : comparison.relation,
    actualLemma: comparison.actualAnalysis?.lemma,
    expectedLemma: comparison.expectedAnalysis?.lemma,
    differences: comparison.differences,
    suggestions: comparison.suggestions,
  }
}

function describeMorphologicalDifferences(
  differences: FinnishMorphologicalDifference[],
): string {
  return differences
    .slice(0, 2)
    .map((difference) => {
      const actual = localizeMorphologyValue(
        difference.feature,
        difference.actual,
      )
      const expected = localizeMorphologyValue(
        difference.feature,
        difference.expected,
      )
      const feature = morphologyFeatureLabels[difference.feature]
      return feature && actual && expected
        ? `${feature}: сейчас ${actual}, нужно ${expected}.`
        : null
    })
    .filter((value): value is string => value !== null)
    .join(' ')
}

const morphologyFeatureLabels: Record<string, string> = {
  case: 'Падеж',
  number: 'Число',
  person: 'Лицо',
  tense: 'Время',
  mood: 'Наклонение',
  possessive: 'Притяжательный суффикс',
  questionClitic: 'Вопросительная частица',
  comparison: 'Степень сравнения',
  partOfSpeech: 'Часть речи',
}

const morphologyValueLabels: Record<string, string> = {
  nominative: 'именительный',
  genitive: 'генитив',
  partitive: 'партитив',
  inessive: 'инессив',
  elative: 'элатив',
  illative: 'иллатив',
  adessive: 'адессив',
  ablative: 'аблатив',
  allative: 'аллатив',
  essive: 'эссив',
  translative: 'транслатив',
  instructive: 'инструктив',
  abessive: 'абессив',
  comitative: 'комитатив',
  accusative: 'аккузатив',
  singular: 'единственное',
  plural: 'множественное',
  first: 'первое',
  second: 'второе',
  third: 'третье',
  passive: 'пассив',
  true: 'есть',
  false: 'нет',
}

function localizeMorphologyValue(
  feature: string,
  value: string | boolean | undefined,
): string | undefined {
  if (value === undefined) return undefined
  const normalized = String(value)
  const localized = morphologyValueLabels[normalized] ?? normalized
  if (feature === 'number') return `${localized} число`
  if (feature === 'person' && normalized !== 'passive') {
    return `${localized} лицо`
  }
  return localized
}

function selectRandomCandidate<T>(candidates: T[]): T | undefined {
  if (candidates.length === 0) return undefined
  return candidates[Math.floor(Math.random() * candidates.length)]
}

function toAttemptResponse(attempt: StoredAttempt): ExerciseAttemptResponse {
  const diagnostics = Array.isArray(attempt.diagnostics)
    ? (attempt.diagnostics as ExerciseAttemptDiagnostic[])
    : []

  return {
    attemptId: attempt.id,
    exerciseId: attempt.exerciseId,
    outcome: attempt.outcome,
    isCorrect: attempt.outcome === AttemptOutcome.CORRECT,
    normalizedAnswer: attempt.normalizedAnswerText,
    diagnostics,
    evidence: attempt.evidence.map((item) => ({
      itemId: item.itemId,
      role: item.role,
      result: item.result,
    })),
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  )
}
