import type {
  CourseProgressResponse,
  LessonPart,
  VocabularyStudyResponse,
  VocabularyStudyResult,
} from '@language/contracts'
import { KnowledgeItemKind, MemoryState } from '@language/database'
import { scheduleReview } from '@language/domain'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '../database/prisma.service'

@Injectable()
export class CourseProgressService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getProgress(
    userId: string,
    routeVersionId: string,
  ): Promise<CourseProgressResponse> {
    const route = await this.prisma.courseRouteVersion.findUnique({
      where: { id: routeVersionId },
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
    const routeEntry = await this.prisma.courseRouteEntry.findUnique({
      where: {
        routeVersionId_lessonId: { routeVersionId, lessonId },
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

      await transaction.userCourseProgress.upsert({
        where: {
          userId_routeVersionId: { userId, routeVersionId },
        },
        update: {
          currentLessonId: lessonId,
          lastActivityAt: now,
        },
        create: {
          userId,
          routeVersionId,
          currentLessonId: lessonId,
          lastActivityAt: now,
        },
      })
    })

    return this.getProgress(userId, routeVersionId)
  }

  async studyVocabularyItem(
    userId: string,
    routeVersionId: string,
    lessonId: string,
    itemId: string,
    result: VocabularyStudyResult,
  ): Promise<VocabularyStudyResponse> {
    const vocabularyItem = await this.prisma.lessonKnowledgeItem.findFirst({
      where: {
        lessonId,
        itemId,
        item: { kind: KnowledgeItemKind.LEXICAL_SENSE },
        lesson: { routeEntries: { some: { routeVersionId } } },
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
        state:
          schedule.state === 'REVIEW'
            ? MemoryState.REVIEW
            : MemoryState.RELEARNING,
        dueAt: schedule.dueAt,
        lastReviewAt: schedule.lastReviewAt,
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
