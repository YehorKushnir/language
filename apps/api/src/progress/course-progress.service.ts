import type {
  CourseProgressResponse,
  LessonVocabularyAnswerResponse,
  LessonVocabularyStudySessionResponse,
  LessonPart,
  PracticeCompletionResponse,
  PracticeSessionResponse,
} from '@language/contracts'
import {
  AttemptOutcome,
  ContentStatus,
  ExerciseKind,
  KnowledgeItemKind,
} from '@language/database'
import { normalizeExactAnswer } from '@language/domain'
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '../database/prisma.service'
import { assertLessonAvailable } from '../common/lesson-access'
import { createRouteMemoryScope } from '../common/route-memory-scope'
import { initialUserMemoryData } from '../common/user-memory'

const PRACTICE_EXERCISE_COUNT = 60
const PRACTICE_PASS_PERCENT = 85
const PRACTICE_REQUIRED_CORRECT = Math.ceil(
  (PRACTICE_EXERCISE_COUNT * PRACTICE_PASS_PERCENT) / 100,
)
const PRACTICE_CORRECTION_DELAY = 12
const VOCABULARY_REQUIRED_CORRECT = 3

@Injectable()
export class CourseProgressService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getProgress(
    userId: string,
    routeVersionId: string,
  ): Promise<CourseProgressResponse> {
    const route = await this.prisma.courseRouteVersion.findUnique({
      where: { id: routeVersionId, status: ContentStatus.CURATED },
      include: {
        entries: {
          orderBy: [{ modulePosition: 'asc' }, { lessonPosition: 'asc' }],
          select: { lessonId: true },
        },
      },
    })

    if (!route) {
      throw new NotFoundException(
        `Course route ${routeVersionId} was not found`,
      )
    }

    const memoryScope = createRouteMemoryScope(userId, routeVersionId)
    const [courseProgress, lessonProgress, dueReviews, nextReview] =
      await Promise.all([
        this.prisma.userCourseProgress.findUnique({
          where: {
            userId_routeVersionId: { userId, routeVersionId },
          },
        }),
        this.prisma.userLessonProgress.findMany({
          where: { userId, routeVersionId },
        }),
        this.prisma.userMemory.count({
          where: { ...memoryScope, dueAt: { lte: new Date() } },
        }),
        this.prisma.userMemory.findFirst({
          where: memoryScope,
          orderBy: { dueAt: 'asc' },
          select: { dueAt: true },
        }),
      ])

    const progressByLesson = new Map(
      lessonProgress.map((progress) => [progress.lessonId, progress]),
    )
    const activePracticeProgress = lessonProgress.filter(
      (progress) => progress.practiceStartedAt && !progress.practiceCompletedAt,
    )
    const activePracticeAttempts =
      activePracticeProgress.length > 0
        ? await this.prisma.userAttempt.findMany({
            where: {
              userId,
              routeVersionId,
              OR: activePracticeProgress.map((progress) => ({
                answeredAt: { gte: progress.practiceStartedAt! },
                exercise: {
                  lessonId: progress.lessonId,
                  kind: ExerciseKind.PREPARED,
                  status: ContentStatus.CURATED,
                },
              })),
            },
            select: {
              id: true,
              exerciseId: true,
              outcome: true,
              exercise: { select: { lessonId: true } },
            },
            orderBy: { answeredAt: 'asc' },
          })
        : []
    const activeAttemptsByLesson = new Map<
      string,
      Array<{ id: string; exerciseId: string; outcome: AttemptOutcome }>
    >()
    for (const attempt of activePracticeAttempts) {
      const lessonId = attempt.exercise.lessonId
      if (!lessonId) continue
      const attempts = activeAttemptsByLesson.get(lessonId) ?? []
      attempts.push(attempt)
      activeAttemptsByLesson.set(lessonId, attempts)
    }
    const lessons = route.entries.map(({ lessonId }) => {
      const progress = progressByLesson.get(lessonId)
      const activeAttempts = activeAttemptsByLesson.get(lessonId)
      const practiceProgressPercent = progress?.practiceCompletedAt
        ? 100
        : activeAttempts
          ? toPracticeProgressPercent(
              summarizePracticeAttempts(activeAttempts).correctAnswers,
            )
          : (progress?.practiceProgressPercent ?? 0)
      return {
        lessonId,
        explanationCompletedAt:
          progress?.explanationCompletedAt?.toISOString() ?? null,
        vocabularyCompletedAt:
          progress?.vocabularyCompletedAt?.toISOString() ?? null,
        practiceCompletedAt:
          progress?.practiceCompletedAt?.toISOString() ?? null,
        practiceProgressPercent,
        completedAt: progress?.completedAt?.toISOString() ?? null,
      }
    })

    return {
      routeVersionId,
      currentLessonId: courseProgress?.currentLessonId ?? null,
      completedLessons: lessons.filter((lesson) => lesson.completedAt).length,
      totalLessons: route.entries.length,
      dueReviews,
      nextReviewAt: nextReview?.dueAt.toISOString() ?? null,
      lessons,
    }
  }

  async completePart(
    userId: string,
    routeVersionId: string,
    lessonId: string,
    part: LessonPart,
  ): Promise<CourseProgressResponse> {
    await assertLessonAvailable(this.prisma, userId, routeVersionId, lessonId)
    const routeEntry = await this.prisma.courseRouteEntry.findFirst({
      where: {
        routeVersionId,
        lessonId,
        routeVersion: { status: ContentStatus.CURATED },
        lesson: { status: ContentStatus.CURATED },
      },
    })

    if (!routeEntry) {
      throw new NotFoundException(
        `Lesson ${lessonId} is not part of route ${routeVersionId}`,
      )
    }

    if (part === 'vocabulary') {
      await this.assertVocabularyStudyComplete(userId, routeVersionId, lessonId)
    }

    const now = new Date()
    const completedPart =
      part === 'explanation'
        ? { explanationCompletedAt: now }
        : part === 'vocabulary'
          ? { vocabularyCompletedAt: now }
          : { practiceCompletedAt: now }

    await this.prisma.$transaction(async (transaction) => {
      const progress = await transaction.userLessonProgress.upsert({
        where: {
          userId_routeVersionId_lessonId: {
            userId,
            routeVersionId,
            lessonId,
          },
        },
        update: completedPart,
        create: {
          userId,
          routeVersionId,
          lessonId,
          ...completedPart,
        },
      })

      const lessonCompleted =
        progress.explanationCompletedAt &&
        progress.vocabularyCompletedAt &&
        progress.practiceCompletedAt

      if (lessonCompleted && !progress.completedAt) {
        await transaction.userLessonProgress.update({
          where: {
            userId_routeVersionId_lessonId: {
              userId,
              routeVersionId,
              lessonId,
            },
          },
          data: { completedAt: now },
        })
      }

      let currentLessonId = lessonId
      let courseCompleted = false
      if (lessonCompleted) {
        const [routeLessons, completedLessons] = await Promise.all([
          transaction.courseRouteEntry.findMany({
            where: { routeVersionId },
            orderBy: [{ modulePosition: 'asc' }, { lessonPosition: 'asc' }],
            select: { lessonId: true },
          }),
          transaction.userLessonProgress.findMany({
            where: {
              userId,
              routeVersionId,
              completedAt: { not: null },
            },
            select: { lessonId: true },
          }),
        ])
        const completedIds = new Set(
          completedLessons.map((item) => item.lessonId),
        )
        completedIds.add(lessonId)
        const nextLesson = routeLessons.find(
          (item) => !completedIds.has(item.lessonId),
        )
        currentLessonId = nextLesson?.lessonId ?? lessonId
        courseCompleted = routeLessons.length > 0 && !nextLesson
      }

      await transaction.userCourseProgress.upsert({
        where: {
          userId_routeVersionId: { userId, routeVersionId },
        },
        update: {
          currentLessonId,
          lastActivityAt: now,
          ...(courseCompleted ? { completedAt: now } : {}),
        },
        create: {
          userId,
          routeVersionId,
          currentLessonId,
          lastActivityAt: now,
          ...(courseCompleted ? { completedAt: now } : {}),
        },
      })
    })

    return this.getProgress(userId, routeVersionId)
  }

  async completePractice(
    userId: string,
    routeVersionId: string,
    lessonId: string,
  ): Promise<PracticeCompletionResponse> {
    await assertLessonAvailable(this.prisma, userId, routeVersionId, lessonId)
    const routeEntry = await this.prisma.courseRouteEntry.findFirst({
      where: {
        routeVersionId,
        lessonId,
        routeVersion: { status: ContentStatus.CURATED },
        lesson: { status: ContentStatus.CURATED },
      },
      select: { lessonId: true },
    })
    if (!routeEntry) {
      throw new NotFoundException(
        `Lesson ${lessonId} is not part of route ${routeVersionId}`,
      )
    }

    const lessonProgress = await this.prisma.userLessonProgress.findUnique({
      where: {
        userId_routeVersionId_lessonId: {
          userId,
          routeVersionId,
          lessonId,
        },
      },
      select: { practiceStartedAt: true, practiceCompletedAt: true },
    })
    if (!lessonProgress?.practiceStartedAt) {
      throw new BadRequestException(
        'Активная практика не найдена. Открой практику урока ещё раз.',
      )
    }

    const attempts = await this.prisma.userAttempt.findMany({
      where: {
        userId,
        routeVersionId,
        answeredAt: { gte: lessonProgress.practiceStartedAt },
        exercise: {
          lessonId,
          kind: ExerciseKind.PREPARED,
          status: ContentStatus.CURATED,
        },
      },
      select: {
        id: true,
        exerciseId: true,
        outcome: true,
      },
      orderBy: { answeredAt: 'asc' },
    })
    const session = summarizePracticeAttempts(attempts)
    if (session.completedExerciseIds.length !== PRACTICE_EXERCISE_COUNT) {
      throw new BadRequestException(
        `Практика должна содержать ${PRACTICE_EXERCISE_COUNT} разных упражнений этого урока.`,
      )
    }
    if (session.correctAnswers < PRACTICE_REQUIRED_CORRECT) {
      throw new BadRequestException(
        `Для прохождения нужно дать минимум ${PRACTICE_REQUIRED_CORRECT} правильных ответов из ${PRACTICE_EXERCISE_COUNT}.`,
      )
    }

    const scorePercent = toPracticeProgressPercent(session.correctAnswers)
    const mode = lessonProgress.practiceCompletedAt ? 'FREE' : 'PROGRESS'
    let progress: CourseProgressResponse
    if (mode === 'PROGRESS') {
      await this.prisma.userLessonProgress.update({
        where: {
          userId_routeVersionId_lessonId: {
            userId,
            routeVersionId,
            lessonId,
          },
        },
        data: { practiceProgressPercent: 100 },
      })
      progress = await this.completePart(
        userId,
        routeVersionId,
        lessonId,
        'practice',
      )
    } else {
      progress = await this.getProgress(userId, routeVersionId)
    }

    await this.prisma.userLessonProgress.update({
      where: {
        userId_routeVersionId_lessonId: {
          userId,
          routeVersionId,
          lessonId,
        },
      },
      data: { practiceStartedAt: null },
    })

    return {
      mode,
      totalExercises: PRACTICE_EXERCISE_COUNT,
      correctAnswers: session.correctAnswers,
      requiredCorrectAnswers: PRACTICE_REQUIRED_CORRECT,
      scorePercent,
      passed: true,
      progress,
    }
  }

  async startOrResumePractice(
    userId: string,
    routeVersionId: string,
    lessonId: string,
  ): Promise<PracticeSessionResponse> {
    await assertLessonAvailable(this.prisma, userId, routeVersionId, lessonId)
    const routeEntry = await this.prisma.courseRouteEntry.findFirst({
      where: {
        routeVersionId,
        lessonId,
        routeVersion: { status: ContentStatus.CURATED },
        lesson: { status: ContentStatus.CURATED },
      },
      select: { lessonId: true },
    })
    if (!routeEntry) {
      throw new NotFoundException(
        `Lesson ${lessonId} is not part of route ${routeVersionId}`,
      )
    }

    const now = new Date()
    const { mode, startedAt, attempts } = await this.prisma.$transaction(
      async (transaction) => {
        const existing = await transaction.userLessonProgress.findUnique({
          where: {
            userId_routeVersionId_lessonId: {
              userId,
              routeVersionId,
              lessonId,
            },
          },
          select: { practiceStartedAt: true, practiceCompletedAt: true },
        })
        const progress = existing?.practiceStartedAt
          ? existing
          : await transaction.userLessonProgress.upsert({
              where: {
                userId_routeVersionId_lessonId: {
                  userId,
                  routeVersionId,
                  lessonId,
                },
              },
              update: {
                practiceStartedAt: now,
                ...(existing?.practiceCompletedAt
                  ? {}
                  : { practiceProgressPercent: 0 }),
              },
              create: {
                userId,
                routeVersionId,
                lessonId,
                practiceStartedAt: now,
                practiceProgressPercent: 0,
              },
              select: { practiceStartedAt: true, practiceCompletedAt: true },
            })
        const startedAt = progress.practiceStartedAt ?? now
        const attempts = await transaction.userAttempt.findMany({
          where: {
            userId,
            routeVersionId,
            answeredAt: { gte: startedAt },
            exercise: {
              lessonId,
              kind: ExerciseKind.PREPARED,
              status: ContentStatus.CURATED,
            },
          },
          orderBy: { answeredAt: 'asc' },
          select: {
            id: true,
            exerciseId: true,
            outcome: true,
          },
        })
        return {
          mode: progress.practiceCompletedAt
            ? ('FREE' as const)
            : ('PROGRESS' as const),
          startedAt,
          attempts,
        }
      },
    )

    const session = summarizePracticeAttempts(attempts)

    return {
      mode,
      startedAt: startedAt.toISOString(),
      totalExercises: PRACTICE_EXERCISE_COUNT,
      requiredCorrectAnswers: PRACTICE_REQUIRED_CORRECT,
      correctionDelay: PRACTICE_CORRECTION_DELAY,
      ...session,
    }
  }

  async startOrResumeVocabulary(
    userId: string,
    routeVersionId: string,
    lessonId: string,
  ): Promise<LessonVocabularyStudySessionResponse> {
    await assertLessonAvailable(this.prisma, userId, routeVersionId, lessonId)
    const vocabularyItems = await this.findLessonVocabularyItems(
      routeVersionId,
      lessonId,
    )
    const now = new Date()

    await this.prisma.userCourseProgress.upsert({
      where: { userId_routeVersionId: { userId, routeVersionId } },
      update: { currentLessonId: lessonId, lastActivityAt: now },
      create: {
        userId,
        routeVersionId,
        currentLessonId: lessonId,
        lastActivityAt: now,
      },
    })

    const progress = await this.prisma.userLessonVocabularyProgress.findMany({
      where: { userId, routeVersionId, lessonId },
    })

    return toVocabularyStudySession(
      lessonId,
      vocabularyItems.map((item) => item.itemId),
      progress,
    )
  }

  async encounterVocabularyItem(
    userId: string,
    routeVersionId: string,
    lessonId: string,
    itemId: string,
  ): Promise<void> {
    await assertLessonAvailable(this.prisma, userId, routeVersionId, lessonId)
    const vocabularyItem = await this.prisma.lessonKnowledgeItem.findFirst({
      where: {
        lessonId,
        itemId,
        item: { kind: KnowledgeItemKind.LEXICAL_SENSE },
        lesson: {
          status: ContentStatus.CURATED,
          routeEntries: {
            some: {
              routeVersionId,
              routeVersion: { status: ContentStatus.CURATED },
            },
          },
        },
      },
      select: { itemId: true },
    })
    if (!vocabularyItem) {
      throw new NotFoundException(
        `Vocabulary item ${itemId} is not part of lesson ${lessonId}`,
      )
    }

    const encounteredAt = new Date()
    await this.prisma.userMemory.upsert({
      where: { userId_itemId: { userId, itemId } },
      update: {},
      create: {
        userId,
        itemId,
        ...initialUserMemoryData(encounteredAt),
      },
    })
  }

  async submitVocabularyAnswer(
    userId: string,
    routeVersionId: string,
    lessonId: string,
    itemId: string,
    answer: string,
    idempotencyKey: string,
    gaveUp = false,
  ): Promise<LessonVocabularyAnswerResponse> {
    if (!gaveUp && !answer.trim()) {
      throw new BadRequestException('Введите ответ или выберите «Не знаю».')
    }

    await assertLessonAvailable(this.prisma, userId, routeVersionId, lessonId)
    const vocabularyItem = await this.prisma.lessonKnowledgeItem.findFirst({
      where: {
        lessonId,
        itemId,
        item: { kind: KnowledgeItemKind.LEXICAL_SENSE },
        lesson: {
          status: ContentStatus.CURATED,
          routeEntries: {
            some: {
              routeVersionId,
              routeVersion: { status: ContentStatus.CURATED },
            },
          },
        },
      },
      select: {
        itemId: true,
        item: {
          select: {
            lexicalSense: {
              select: {
                lexicalEntry: { select: { lemma: true } },
              },
            },
          },
        },
      },
    })

    const expectedAnswer = vocabularyItem?.item.lexicalSense?.lexicalEntry.lemma
    if (!vocabularyItem || !expectedAnswer) {
      throw new NotFoundException(
        `Vocabulary item ${itemId} is not part of lesson ${lessonId}`,
      )
    }

    const respondToDuplicate = async (duplicate: {
      routeVersionId: string
      lessonId: string
      itemId: string
      isCorrect: boolean
    }): Promise<LessonVocabularyAnswerResponse> => {
      if (
        duplicate.routeVersionId !== routeVersionId ||
        duplicate.lessonId !== lessonId ||
        duplicate.itemId !== itemId
      ) {
        throw new BadRequestException(
          'Ключ ответа уже использован для другой карточки.',
        )
      }
      const session = await this.startOrResumeVocabulary(
        userId,
        routeVersionId,
        lessonId,
      )
      if (
        session.totalItems > 0 &&
        session.completedItems === session.totalItems
      ) {
        await this.completePart(userId, routeVersionId, lessonId, 'vocabulary')
      }
      return {
        itemId,
        isCorrect: duplicate.isCorrect,
        expectedAnswer,
        itemProgress: session.items.find((item) => item.itemId === itemId)!,
        session,
      }
    }

    const duplicate = await this.prisma.userLessonVocabularyAttempt.findUnique({
      where: { userId_idempotencyKey: { userId, idempotencyKey } },
    })
    if (duplicate) {
      return respondToDuplicate(duplicate)
    }

    const isCorrect =
      !gaveUp &&
      normalizeExactAnswer(answer) === normalizeExactAnswer(expectedAnswer)
    const now = new Date()
    const saveAnswer = () =>
      this.prisma.$transaction(async (transaction) => {
        await transaction.userMemory.upsert({
          where: { userId_itemId: { userId, itemId } },
          update: {},
          create: {
            userId,
            itemId,
            ...initialUserMemoryData(now),
          },
        })

        await transaction.userLessonVocabularyProgress.upsert({
          where: {
            userId_routeVersionId_lessonId_itemId: {
              userId,
              routeVersionId,
              lessonId,
              itemId,
            },
          },
          update: {
            attempts: { increment: 1 },
            lastAnsweredAt: now,
          },
          create: {
            userId,
            routeVersionId,
            lessonId,
            itemId,
            attempts: 1,
            lastAnsweredAt: now,
          },
        })

        if (isCorrect) {
          await transaction.userLessonVocabularyProgress.updateMany({
            where: {
              userId,
              routeVersionId,
              lessonId,
              itemId,
              correctAnswers: { lt: VOCABULARY_REQUIRED_CORRECT },
            },
            data: { correctAnswers: { increment: 1 } },
          })
        }

        let progress =
          await transaction.userLessonVocabularyProgress.findUniqueOrThrow({
            where: {
              userId_routeVersionId_lessonId_itemId: {
                userId,
                routeVersionId,
                lessonId,
                itemId,
              },
            },
          })
        if (
          progress.correctAnswers >= VOCABULARY_REQUIRED_CORRECT &&
          !progress.completedAt
        ) {
          progress = await transaction.userLessonVocabularyProgress.update({
            where: {
              userId_routeVersionId_lessonId_itemId: {
                userId,
                routeVersionId,
                lessonId,
                itemId,
              },
            },
            data: { completedAt: now },
          })
        }

        await transaction.userLessonVocabularyAttempt.create({
          data: {
            userId,
            routeVersionId,
            lessonId,
            itemId,
            idempotencyKey,
            answerText: answer.trim(),
            isCorrect,
            correctAnswersAfter: progress.correctAnswers,
            answeredAt: now,
          },
        })

        await transaction.userCourseProgress.upsert({
          where: { userId_routeVersionId: { userId, routeVersionId } },
          update: { currentLessonId: lessonId, lastActivityAt: now },
          create: {
            userId,
            routeVersionId,
            currentLessonId: lessonId,
            lastActivityAt: now,
          },
        })

        return progress
      })
    let itemProgress: Awaited<ReturnType<typeof saveAnswer>>
    try {
      itemProgress = await saveAnswer()
    } catch (error: unknown) {
      if (isUniqueConstraintError(error)) {
        const concurrent =
          await this.prisma.userLessonVocabularyAttempt.findUnique({
            where: { userId_idempotencyKey: { userId, idempotencyKey } },
          })
        if (concurrent) return respondToDuplicate(concurrent)
      }
      throw error
    }

    const session = await this.startOrResumeVocabulary(
      userId,
      routeVersionId,
      lessonId,
    )
    if (
      session.totalItems > 0 &&
      session.completedItems === session.totalItems
    ) {
      await this.completePart(userId, routeVersionId, lessonId, 'vocabulary')
    }

    return {
      itemId,
      isCorrect,
      expectedAnswer,
      itemProgress: toVocabularyStudyProgress(itemProgress),
      session,
    }
  }

  private findLessonVocabularyItems(routeVersionId: string, lessonId: string) {
    return this.prisma.lessonKnowledgeItem.findMany({
      where: {
        lessonId,
        item: { kind: KnowledgeItemKind.LEXICAL_SENSE },
        lesson: {
          status: ContentStatus.CURATED,
          routeEntries: {
            some: {
              routeVersionId,
              routeVersion: { status: ContentStatus.CURATED },
            },
          },
        },
      },
      orderBy: [{ position: 'asc' }, { itemId: 'asc' }],
      select: { itemId: true },
    })
  }

  private async assertVocabularyStudyComplete(
    userId: string,
    routeVersionId: string,
    lessonId: string,
  ): Promise<void> {
    const vocabularyItems = await this.findLessonVocabularyItems(
      routeVersionId,
      lessonId,
    )
    const completedItems = await this.prisma.userLessonVocabularyProgress.count(
      {
        where: {
          userId,
          routeVersionId,
          lessonId,
          itemId: { in: vocabularyItems.map((item) => item.itemId) },
          correctAnswers: { gte: VOCABULARY_REQUIRED_CORRECT },
        },
      },
    )

    if (
      vocabularyItems.length === 0 ||
      completedItems !== vocabularyItems.length
    ) {
      throw new BadRequestException(
        'Чтобы завершить слова урока, ответь правильно три раза на каждую карточку.',
      )
    }
  }
}

function summarizePracticeAttempts(
  attempts: Array<{
    id: string
    exerciseId: string
    outcome: AttemptOutcome
  }>,
) {
  const firstAttempts = new Map<string, (typeof attempts)[number]>()
  const latestAttempts = new Map<string, (typeof attempts)[number]>()
  const pendingCorrections = new Map<
    string,
    { exerciseId: string; retryAfterAttempt: number }
  >()

  attempts.forEach((attempt, index) => {
    if (!firstAttempts.has(attempt.exerciseId)) {
      firstAttempts.set(attempt.exerciseId, attempt)
    }
    latestAttempts.set(attempt.exerciseId, attempt)

    pendingCorrections.delete(attempt.exerciseId)
    if (attempt.outcome !== AttemptOutcome.CORRECT) {
      pendingCorrections.set(attempt.exerciseId, {
        exerciseId: attempt.exerciseId,
        retryAfterAttempt: index + 1 + PRACTICE_CORRECTION_DELAY,
      })
    }
  })

  const primaryAttempts = [...firstAttempts.values()].slice(
    0,
    PRACTICE_EXERCISE_COUNT,
  )
  const completedExerciseIds = primaryAttempts.map(
    (attempt) => attempt.exerciseId,
  )
  const completedExerciseIdSet = new Set(completedExerciseIds)

  return {
    answeredExercises: primaryAttempts.length,
    correctAnswers: completedExerciseIds.filter(
      (exerciseId) =>
        latestAttempts.get(exerciseId)?.outcome === AttemptOutcome.CORRECT,
    ).length,
    attemptIds: attempts.map((attempt) => attempt.id),
    completedExerciseIds,
    pendingCorrections: [...pendingCorrections.values()].filter((correction) =>
      completedExerciseIdSet.has(correction.exerciseId),
    ),
  }
}

function toPracticeProgressPercent(correctAnswers: number): number {
  return Math.round((correctAnswers / PRACTICE_EXERCISE_COUNT) * 100)
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  )
}

function toVocabularyStudyProgress(progress: {
  itemId: string
  correctAnswers: number
  attempts: number
  completedAt: Date | null
}) {
  return {
    itemId: progress.itemId,
    correctAnswers: progress.correctAnswers,
    attempts: progress.attempts,
    completedAt: progress.completedAt?.toISOString() ?? null,
  }
}

function toVocabularyStudySession(
  lessonId: string,
  itemIds: string[],
  progress: Array<{
    itemId: string
    correctAnswers: number
    attempts: number
    completedAt: Date | null
  }>,
): LessonVocabularyStudySessionResponse {
  const progressByItem = new Map(progress.map((item) => [item.itemId, item]))
  const items = itemIds.map((itemId) => {
    const itemProgress = progressByItem.get(itemId)
    return itemProgress
      ? toVocabularyStudyProgress(itemProgress)
      : { itemId, correctAnswers: 0, attempts: 0, completedAt: null }
  })

  return {
    lessonId,
    requiredCorrectAnswers: VOCABULARY_REQUIRED_CORRECT,
    totalItems: items.length,
    completedItems: items.filter(
      (item) => item.correctAnswers >= VOCABULARY_REQUIRED_CORRECT,
    ).length,
    totalCorrectAnswers: items.reduce(
      (total, item) => total + item.correctAnswers,
      0,
    ),
    items,
  }
}
