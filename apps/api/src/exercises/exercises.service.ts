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
  MemoryState,
  Prisma,
} from '@language/database'
import {
  checkStructuredAnswer,
  checkStructuredAnswerItems,
  scheduleReview,
  type StructuredAnswerDiagnostic,
  type StructuredAnswerSlot,
} from '@language/domain'
import type {
  FinnishFormComparison,
  FinnishMorphologicalDifference,
} from '@language/language-fi'
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '../database/prisma.service'
import { FinnishMorphologyService } from '../morphology/finnish-morphology.service'

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
  ) {}

  async getNextExercise(
    userId: string,
    lessonId: string,
    sourceLanguage: string,
    excludedExerciseIds: string[],
  ): Promise<PreparedExerciseResponse> {
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
        userHistory: { where: { userId }, take: 1 },
      },
    })
    const exercise = candidates.sort(compareExerciseCandidates)[0]

    const prompt = exercise?.prompts[0]
    if (!exercise || !prompt) {
      throw new NotFoundException(
        `No exercise for lesson ${lessonId} and language ${sourceLanguage}`,
      )
    }

    return {
      id: exercise.id,
      lessonId,
      sourceLanguage,
      targetLanguage: exercise.targetLanguage,
      prompt: prompt.text,
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
      where: { id: exerciseId, status: ContentStatus.CURATED },
      include: { items: true },
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

    const answerSpec = toStoredAnswerSpec(exercise.answerSpec)
    const check = checkStructuredAnswer(request.answer, answerSpec)
    const resultByItem = new Map(
      checkStructuredAnswerItems(request.answer, answerSpec).map((result) => [
        result.itemId,
        result.isCorrect,
      ]),
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
            ? await this.morphology.compareForms(
                diagnostic.actual,
                diagnostic.expected,
              )
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
          : (resultByItem.get(item.itemId) ?? check.isCorrect)
            ? EvidenceResult.SUCCESS
            : EvidenceResult.FAILURE,
      score:
        item.role === ExerciseItemRole.CONTEXT
          ? null
          : (resultByItem.get(item.itemId) ?? check.isCorrect)
            ? 1
            : 0,
    }))
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
            checkerVersion: 'structured-v2-voikko',
            durationMs: request.durationMs,
            answeredAt: now,
            evidence: { create: evidence },
          },
          include: { evidence: true },
        })

        for (const itemEvidence of evidence) {
          if (itemEvidence.result === EvidenceResult.IGNORED) {
            continue
          }

          const memory = await transaction.userMemory.findUnique({
            where: {
              userId_itemId: { userId, itemId: itemEvidence.itemId },
            },
          })
          const schedule = scheduleReview(
            memory
              ? {
                  difficulty: memory.difficulty,
                  stability: memory.stability,
                  state: memory.state,
                  dueAt: memory.dueAt,
                  lastReviewAt: memory.lastReviewAt,
                  elapsedDays: memory.elapsedDays,
                  scheduledDays: memory.scheduledDays,
                  learningSteps: memory.learningSteps,
                  repetitions: memory.repetitions,
                  lapses: memory.lapses,
                }
              : null,
            itemEvidence.result === EvidenceResult.SUCCESS
              ? 'SUCCESS'
              : 'FAILURE',
            now,
          )
          const memoryData = {
            difficulty: schedule.difficulty,
            stability: schedule.stability,
            state: MemoryState[schedule.state],
            dueAt: schedule.dueAt,
            lastReviewAt: schedule.lastReviewAt,
            elapsedDays: schedule.elapsedDays,
            scheduledDays: schedule.scheduledDays,
            learningSteps: schedule.learningSteps,
            repetitions: schedule.repetitions,
            lapses: schedule.lapses,
          }

          await transaction.userMemory.upsert({
            where: {
              userId_itemId: { userId, itemId: itemEvidence.itemId },
            },
            update: memoryData,
            create: {
              userId,
              itemId: itemEvidence.itemId,
              ...memoryData,
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

        return created as StoredAttempt
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
        status: 'OPEN',
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
}

function toStoredAnswerSpec(value: unknown): StoredAnswerSpec {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { acceptedVariants: [], slots: [] }
  }

  const candidate = value as Record<string, unknown>
  const acceptedVariants = candidate.acceptedVariants
  return {
    acceptedVariants: Array.isArray(acceptedVariants)
      ? acceptedVariants.filter(
          (variant): variant is string => typeof variant === 'string',
        )
      : [],
    slots: Array.isArray(candidate.slots)
      ? candidate.slots.flatMap((slot) => {
          if (!slot || typeof slot !== 'object' || Array.isArray(slot)) {
            return []
          }

          const slotCandidate = slot as Record<string, unknown>
          const accepted = Array.isArray(slotCandidate.accepted)
            ? slotCandidate.accepted.filter(
                (variant): variant is string => typeof variant === 'string',
              )
            : []
          const itemIds = Array.isArray(slotCandidate.itemIds)
            ? slotCandidate.itemIds.filter(
                (itemId): itemId is string => typeof itemId === 'string',
              )
            : []
          return typeof slotCandidate.role === 'string' && accepted.length > 0
            ? [{ role: slotCandidate.role, accepted, itemIds }]
            : []
        })
      : [],
  }
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

function compareExerciseCandidates(
  left: {
    id: string
    answerSpec: unknown
    userHistory: Array<{ timesSeen: number; lastSeenAt: Date }>
  },
  right: {
    id: string
    answerSpec: unknown
    userHistory: Array<{ timesSeen: number; lastSeenAt: Date }>
  },
): number {
  const leftHistory = left.userHistory[0]
  const rightHistory = right.userHistory[0]
  const seenDifference =
    (leftHistory?.timesSeen ?? 0) - (rightHistory?.timesSeen ?? 0)
  if (seenDifference !== 0) {
    return seenDifference
  }

  const orderDifference =
    getSelectionOrder(left.answerSpec) - getSelectionOrder(right.answerSpec)
  if (orderDifference !== 0) {
    return orderDifference
  }

  return left.id.localeCompare(right.id)
}

function getSelectionOrder(value: unknown): number {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return Number.MAX_SAFE_INTEGER
  }

  const selectionOrder = (value as Record<string, unknown>).selectionOrder
  return typeof selectionOrder === 'number'
    ? selectionOrder
    : Number.MAX_SAFE_INTEGER
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
