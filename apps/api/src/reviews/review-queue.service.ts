import type {
  NextReviewResponse,
  ReviewQueueResponse,
} from '@language/contracts'
import {
  ContentStatus,
  ExerciseItemRole,
  ExerciseKind,
} from '@language/database'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import { toLocalizedText } from '../common/content-mapper'
import { PrismaService } from '../database/prisma.service'
import { ExerciseGenerationService } from '../generation/exercise-generation.service'

@Injectable()
export class ReviewQueueService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ExerciseGenerationService)
    private readonly generation: ExerciseGenerationService,
  ) {}

  async getQueue(
    userId: string,
    routeVersionId: string,
  ): Promise<ReviewQueueResponse> {
    const route = await this.prisma.courseRouteVersion.findUnique({
      where: { id: routeVersionId, status: ContentStatus.CURATED },
      select: { id: true },
    })
    if (!route) {
      throw new NotFoundException(
        `Course route ${routeVersionId} was not found`,
      )
    }

    const where = {
      userId,
      item: {
        OR: [
          {
            lessonItems: {
              some: {
                lesson: {
                  routeEntries: { some: { routeVersionId } },
                },
              },
            },
          },
          {
            textItems: {
              some: {
                text: {
                  course: {
                    routeVersions: { some: { id: routeVersionId } },
                  },
                },
              },
            },
          },
        ],
      },
    }
    const now = new Date()
    const [memories, totalCount, dueCount, nextMemory] = await Promise.all([
      this.prisma.userMemory.findMany({
        where,
        orderBy: { dueAt: 'asc' },
        take: 100,
        include: {
          item: {
            include: { skill: true, lexicalSense: true },
          },
        },
      }),
      this.prisma.userMemory.count({ where }),
      this.prisma.userMemory.count({
        where: { ...where, dueAt: { lte: now } },
      }),
      this.prisma.userMemory.findFirst({
        where,
        orderBy: { dueAt: 'asc' },
        select: { dueAt: true },
      }),
    ])

    return {
      routeVersionId,
      dueCount,
      totalCount,
      nextDueAt: nextMemory?.dueAt.toISOString() ?? null,
      items: memories.map((memory) => ({
        itemId: memory.itemId,
        kind: memory.item.kind,
        label: toLocalizedText(
          memory.item.skill?.name ??
            memory.item.lexicalSense?.gloss ?? { ru: memory.itemId },
        ),
        state: memory.state,
        dueAt: memory.dueAt.toISOString(),
        isDue: memory.dueAt <= now,
        repetitions: memory.repetitions,
        lapses: memory.lapses,
      })),
    }
  }

  async getNext(
    userId: string,
    routeVersionId: string,
    sourceLanguage: string,
    excludedExerciseIds: string[],
  ): Promise<NextReviewResponse> {
    const route = await this.prisma.courseRouteVersion.findUnique({
      where: { id: routeVersionId, status: ContentStatus.CURATED },
      select: { id: true },
    })
    if (!route) {
      throw new NotFoundException(
        `Course route ${routeVersionId} was not found`,
      )
    }

    const now = new Date()
    const dueMemories = await this.prisma.userMemory.findMany({
      where: {
        ...createMemoryScope(userId, routeVersionId),
        dueAt: { lte: now },
      },
      orderBy: { dueAt: 'asc' },
      select: { itemId: true },
    })
    const dueItemIds = dueMemories.map((memory) => memory.itemId)
    if (dueItemIds.length === 0) {
      return { dueCount: 0, exercise: null }
    }

    const generatedExercise = await this.generation.getOrCreateReviewExercise(
      userId,
      routeVersionId,
      sourceLanguage,
      dueItemIds,
      excludedExerciseIds,
    )
    if (generatedExercise) {
      return { dueCount: dueItemIds.length, exercise: generatedExercise }
    }

    const candidates = await this.prisma.exercise.findMany({
      where: {
        kind: ExerciseKind.PREPARED,
        status: ContentStatus.CURATED,
        lesson: { routeEntries: { some: { routeVersionId } } },
        prompts: { some: { sourceLanguage } },
        items: {
          some: {
            itemId: { in: dueItemIds },
            role: {
              in: [ExerciseItemRole.PRIMARY, ExerciseItemRole.SECONDARY],
            },
          },
        },
        ...(excludedExerciseIds.length > 0
          ? { id: { notIn: excludedExerciseIds } }
          : {}),
      },
      include: {
        prompts: { where: { sourceLanguage }, take: 1 },
        items: {
          where: {
            itemId: { in: dueItemIds },
            role: {
              in: [ExerciseItemRole.PRIMARY, ExerciseItemRole.SECONDARY],
            },
          },
        },
      },
    })
    const duePosition = new Map(
      dueItemIds.map((itemId, index) => [itemId, index]),
    )
    const exercise = candidates.sort((left, right) => {
      const leftPosition = Math.min(
        ...left.items.map(
          (item) => duePosition.get(item.itemId) ?? Number.MAX_SAFE_INTEGER,
        ),
      )
      const rightPosition = Math.min(
        ...right.items.map(
          (item) => duePosition.get(item.itemId) ?? Number.MAX_SAFE_INTEGER,
        ),
      )
      return leftPosition - rightPosition || left.id.localeCompare(right.id)
    })[0]
    const prompt = exercise?.prompts[0]

    if (!exercise || !prompt || !exercise.lessonId) {
      return { dueCount: dueItemIds.length, exercise: null }
    }

    return {
      dueCount: dueItemIds.length,
      exercise: {
        id: exercise.id,
        lessonId: exercise.lessonId,
        sourceLanguage,
        targetLanguage: exercise.targetLanguage,
        prompt: prompt.text,
        reviewItemIds: exercise.items.map((item) => item.itemId),
      },
    }
  }
}

function createMemoryScope(userId: string, routeVersionId: string) {
  return {
    userId,
    item: {
      OR: [
        {
          lessonItems: {
            some: {
              lesson: {
                routeEntries: { some: { routeVersionId } },
              },
            },
          },
        },
        {
          textItems: {
            some: {
              text: {
                course: { routeVersions: { some: { id: routeVersionId } } },
              },
            },
          },
        },
      ],
    },
  }
}
