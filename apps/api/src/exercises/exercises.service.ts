import type {
  ExerciseAttemptDiagnostic,
  ExerciseAttemptRequest,
  ExerciseAttemptResponse,
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
  scheduleReview,
  type StructuredAnswerDiagnostic,
  type StructuredAnswerSlot,
} from '@language/domain'
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '../database/prisma.service'

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
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

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

    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: { items: true },
    })
    if (!exercise) {
      throw new NotFoundException(`Exercise ${exerciseId} was not found`)
    }

    if (!exercise.lessonId) {
      throw new ConflictException('Exercise is not attached to a lesson')
    }

    const routeEntry = await this.prisma.courseRouteEntry.findUnique({
      where: {
        routeVersionId_lessonId: {
          routeVersionId: request.routeVersionId,
          lessonId: exercise.lessonId,
        },
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
    const outcome = check.isCorrect
      ? AttemptOutcome.CORRECT
      : AttemptOutcome.INCORRECT
    const diagnostics = check.diagnostics.map(toAttemptDiagnostic)
    const evidence = exercise.items.map((item) => ({
      itemId: item.itemId,
      role: item.role,
      result:
        item.role === ExerciseItemRole.CONTEXT
          ? EvidenceResult.IGNORED
          : check.isCorrect
            ? EvidenceResult.SUCCESS
            : EvidenceResult.FAILURE,
      score:
        item.role === ExerciseItemRole.CONTEXT ? null : check.isCorrect ? 1 : 0,
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
            checkerVersion: 'structured-v1',
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
            state:
              schedule.state === 'REVIEW'
                ? MemoryState.REVIEW
                : MemoryState.RELEARNING,
            dueAt: schedule.dueAt,
            lastReviewAt: schedule.lastReviewAt,
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
          return typeof slotCandidate.role === 'string' && accepted.length > 0
            ? [{ role: slotCandidate.role, accepted }]
            : []
        })
      : [],
  }
}

function toAttemptDiagnostic(
  diagnostic: StructuredAnswerDiagnostic,
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

  if (diagnostic.code === 'WRONG_FORM') {
    return {
      code: diagnostic.code,
      message: {
        ru: `Форма «${diagnostic.actual ?? '—'}» здесь не подходит${expected ? `. Ожидалось ${expected}` : ''}.`,
      },
    }
  }

  return {
    code: 'ANSWER_MISMATCH',
    message: { ru: 'Пока не совпало. Проверь слова и их формы.' },
  }
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
