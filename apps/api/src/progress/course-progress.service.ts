import type {
  CourseProgressResponse,
  LessonPart,
  PracticeCompletionResponse,
  VocabularyStudyResponse,
  VocabularyStudyResult,
} from '@language/contracts'
import {
  AttemptOutcome,
  ContentStatus,
  ExerciseKind,
  KnowledgeItemKind,
  MemoryState,
} from '@language/database'
import { scheduleReview } from '@language/domain'
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '../database/prisma.service'
import { assertLessonAvailable } from '../common/lesson-access'

const PRACTICE_EXERCISE_COUNT = 60
const PRACTICE_PASS_RATE = 0.85
const PRACTICE_REQUIRED_CORRECT = Math.ceil(
  PRACTICE_EXERCISE_COUNT * PRACTICE_PASS_RATE,
)

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

    const memoryScope = {
      userId,
      item: {
        lessonItems: {
          some: {
            lesson: {
              routeEntries: { some: { routeVersionId } },
            },
          },
        },
      },
    }
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
    const lessons = route.entries.map(({ lessonId }) => {
      const progress = progressByLesson.get(lessonId)
      return {
        lessonId,
        explanationCompletedAt:
          progress?.explanationCompletedAt?.toISOString() ?? null,
        vocabularyCompletedAt:
          progress?.vocabularyCompletedAt?.toISOString() ?? null,
        practiceCompletedAt:
          progress?.practiceCompletedAt?.toISOString() ?? null,
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
    attemptIds: string[],
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

    if (
      attemptIds.length !== PRACTICE_EXERCISE_COUNT ||
      new Set(attemptIds).size !== PRACTICE_EXERCISE_COUNT
    ) {
      throw new BadRequestException(
        `Для завершения практики нужны результаты ${PRACTICE_EXERCISE_COUNT} уникальных упражнений.`,
      )
    }

    const attempts = await this.prisma.userAttempt.findMany({
      where: {
        id: { in: attemptIds },
        userId,
        routeVersionId,
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
    })
    const exerciseIds = new Set(attempts.map((attempt) => attempt.exerciseId))
    if (
      attempts.length !== PRACTICE_EXERCISE_COUNT ||
      exerciseIds.size !== PRACTICE_EXERCISE_COUNT
    ) {
      throw new BadRequestException(
        `Практика должна содержать ${PRACTICE_EXERCISE_COUNT} разных упражнений этого урока.`,
      )
    }

    const correctAnswers = attempts.filter(
      (attempt) => attempt.outcome === AttemptOutcome.CORRECT,
    ).length
    const passed = correctAnswers >= PRACTICE_REQUIRED_CORRECT
    const scorePercent =
      Math.round((correctAnswers / PRACTICE_EXERCISE_COUNT) * 1_000) / 10
    const progress = passed
      ? await this.completePart(userId, routeVersionId, lessonId, 'practice')
      : await this.getProgress(userId, routeVersionId)

    return {
      totalExercises: PRACTICE_EXERCISE_COUNT,
      correctAnswers,
      requiredCorrectAnswers: PRACTICE_REQUIRED_CORRECT,
      scorePercent,
      passed,
      progress,
    }
  }

  async studyVocabularyItem(
    userId: string,
    routeVersionId: string,
    lessonId: string,
    itemId: string,
    result: VocabularyStudyResult,
  ): Promise<VocabularyStudyResponse> {
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

    const now = new Date()
    const memory = await this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.userMemory.findUnique({
        where: { userId_itemId: { userId, itemId } },
      })
      const schedule = scheduleReview(
        existing
          ? {
              difficulty: existing.difficulty,
              stability: existing.stability,
              state: existing.state,
              dueAt: existing.dueAt,
              lastReviewAt: existing.lastReviewAt,
              elapsedDays: existing.elapsedDays,
              scheduledDays: existing.scheduledDays,
              learningSteps: existing.learningSteps,
              repetitions: existing.repetitions,
              lapses: existing.lapses,
            }
          : null,
        result,
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

      const updatedMemory = await transaction.userMemory.upsert({
        where: { userId_itemId: { userId, itemId } },
        update: memoryData,
        create: { userId, itemId, ...memoryData },
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

      return updatedMemory
    })

    return {
      itemId: memory.itemId,
      state: memory.state,
      dueAt: memory.dueAt.toISOString(),
      repetitions: memory.repetitions,
      lapses: memory.lapses,
    }
  }
}
