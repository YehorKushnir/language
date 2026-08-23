import { createHash } from 'node:crypto'

import type { PreparedReviewExerciseResponse } from '@language/contracts'
import {
  ContentStatus,
  ExerciseItemRole,
  ExerciseKind,
  Prisma,
} from '@language/database'
import {
  realizeFinnishIdentity,
  validateFinnishIdentityTemplate,
  type FinnishIdentityCategory,
  type FinnishIdentityParameters,
  type FinnishIdentityTemplateDefinition,
} from '@language/language-fi'
import { Inject, Injectable } from '@nestjs/common'

import { PrismaService } from '../database/prisma.service'
import { FinnishMorphologyService } from '../morphology/finnish-morphology.service'

const GENERATOR_VERSION = 'finnish-identity-v1'
const PUBLISHED_GENERATED_STATUSES = [
  ContentStatus.GENERATED,
  ContentStatus.VERIFIED,
  ContentStatus.CURATED,
]

interface GeneratedCandidateRecord {
  id: string
  lessonId: string | null
  targetLanguage: string
  prompts: Array<{ text: string }>
  items: Array<{ itemId: string; role: ExerciseItemRole }>
}

@Injectable()
export class ExerciseGenerationService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(FinnishMorphologyService)
    private readonly morphology: FinnishMorphologyService,
  ) {}

  async getOrCreateReviewExercise(
    userId: string,
    routeVersionId: string,
    sourceLanguage: string,
    dueItemIds: string[],
    excludedExerciseIds: string[],
  ): Promise<PreparedReviewExerciseResponse | null> {
    const primaryDueItemId = dueItemIds[0]
    if (!primaryDueItemId) return null
    const cached = await this.findCachedExercise(
      routeVersionId,
      sourceLanguage,
      dueItemIds,
      primaryDueItemId,
      excludedExerciseIds,
    )
    if (cached) return this.mapExercise(cached, sourceLanguage, dueItemIds)

    const template = await this.prisma.exerciseTemplate.findFirst({
      where: {
        frame: 'identity',
        status: ContentStatus.CURATED,
        course: {
          routeVersions: {
            some: { id: routeVersionId, status: ContentStatus.CURATED },
          },
        },
      },
      orderBy: { version: 'desc' },
      select: { id: true, courseId: true, definition: true },
    })
    if (!template) return null

    validateFinnishIdentityTemplate(template.definition)
    const definition = template.definition
    if (definition.sourceLanguage !== sourceLanguage) return null
    const supportedItemIds = new Set([
      ...Object.values(definition.grammarItems),
      ...definition.complements.map((item) => item.itemId),
    ])
    if (!supportedItemIds.has(primaryDueItemId)) return null

    const parameters = await this.createParameterCandidates(
      userId,
      definition,
      dueItemIds,
    )
    for (const candidate of parameters) {
      const parametersHash = hashParameters(
        template.id,
        routeVersionId,
        candidate,
      )
      const exerciseId = `generated.${parametersHash.slice(0, 24)}`
      if (excludedExerciseIds.includes(exerciseId)) continue

      const existing = await this.findExerciseById(
        exerciseId,
        sourceLanguage,
        dueItemIds,
      )
      if (existing) {
        return this.mapExercise(existing, sourceLanguage, dueItemIds)
      }

      const realization = realizeFinnishIdentity(definition, candidate)
      await this.assertMorphologicallyValid(realization.targetText)
      const testedItemIds = [
        realization.grammarItemId,
        realization.vocabularyItemId,
      ]
      const duePosition = new Map(
        dueItemIds.map((itemId, index) => [itemId, index]),
      )
      const primaryItemId = [...testedItemIds].sort(
        (left, right) =>
          (duePosition.get(left) ?? Number.MAX_SAFE_INTEGER) -
          (duePosition.get(right) ?? Number.MAX_SAFE_INTEGER),
      )[0]

      try {
        const created = await this.prisma.exercise.create({
          data: {
            id: exerciseId,
            courseId: template.courseId,
            lessonId: definition.lessonId,
            kind: ExerciseKind.GENERATED,
            status: ContentStatus.GENERATED,
            targetLanguage: definition.targetLanguage,
            targetText: realization.targetText,
            answerSpec: {
              acceptedVariants: realization.acceptedVariants,
              slots: realization.slots,
              parameters: candidate,
              generatorVersion: GENERATOR_VERSION,
            } as unknown as Prisma.InputJsonValue,
            prompts: {
              create: {
                sourceLanguage: definition.sourceLanguage,
                text: realization.prompt,
              },
            },
            items: {
              create: testedItemIds.map((itemId) => ({
                itemId,
                role:
                  itemId === primaryItemId
                    ? ExerciseItemRole.PRIMARY
                    : ExerciseItemRole.SECONDARY,
                testedFeatures: candidate as unknown as Prisma.InputJsonValue,
              })),
            },
            generated: {
              create: {
                templateId: template.id,
                routeVersionId,
                parametersHash,
                generatorVersion: GENERATOR_VERSION,
              },
            },
          },
          include: {
            prompts: { where: { sourceLanguage }, take: 1 },
            items: {
              where: { itemId: { in: dueItemIds } },
            },
          },
        })
        return this.mapExercise(created, sourceLanguage, dueItemIds)
      } catch (error) {
        if (!isUniqueConstraintError(error)) throw error
        const winner = await this.findExerciseById(
          exerciseId,
          sourceLanguage,
          dueItemIds,
        )
        if (winner) return this.mapExercise(winner, sourceLanguage, dueItemIds)
      }
    }

    return null
  }

  private async findCachedExercise(
    routeVersionId: string,
    sourceLanguage: string,
    dueItemIds: string[],
    primaryDueItemId: string,
    excludedExerciseIds: string[],
  ): Promise<GeneratedCandidateRecord | null> {
    const candidates = await this.prisma.exercise.findMany({
      where: {
        kind: ExerciseKind.GENERATED,
        status: { in: PUBLISHED_GENERATED_STATUSES },
        generated: {
          routeVersionId,
          template: { status: ContentStatus.CURATED },
        },
        prompts: { some: { sourceLanguage } },
        items: { some: { itemId: primaryDueItemId } },
        ...(excludedExerciseIds.length > 0
          ? { id: { notIn: excludedExerciseIds } }
          : {}),
      },
      include: {
        prompts: { where: { sourceLanguage }, take: 1 },
        items: { where: { itemId: { in: dueItemIds } } },
      },
    })
    const duePosition = new Map(
      dueItemIds.map((itemId, index) => [itemId, index]),
    )
    return (
      candidates.sort(
        (left, right) =>
          firstDuePosition(left.items, duePosition) -
            firstDuePosition(right.items, duePosition) ||
          left.id.localeCompare(right.id),
      )[0] ?? null
    )
  }

  private findExerciseById(
    exerciseId: string,
    sourceLanguage: string,
    dueItemIds: string[],
  ): Promise<GeneratedCandidateRecord | null> {
    return this.prisma.exercise.findFirst({
      where: {
        id: exerciseId,
        kind: ExerciseKind.GENERATED,
        status: { in: PUBLISHED_GENERATED_STATUSES },
      },
      include: {
        prompts: { where: { sourceLanguage }, take: 1 },
        items: { where: { itemId: { in: dueItemIds } } },
      },
    })
  }

  private async createParameterCandidates(
    userId: string,
    definition: FinnishIdentityTemplateDefinition,
    dueItemIds: string[],
  ): Promise<FinnishIdentityParameters[]> {
    const dueCategories = (
      Object.entries(definition.grammarItems) as Array<
        [FinnishIdentityCategory, string]
      >
    )
      .filter(([, itemId]) => dueItemIds.includes(itemId))
      .map(([category]) => category)
    const categories =
      dueCategories.length > 0
        ? dueCategories
        : (['affirmative', 'negative', 'question'] as const)
    const dueComplement = definition.complements.find((item) =>
      dueItemIds.includes(item.itemId),
    )
    const learnedMemories = dueComplement
      ? []
      : await this.prisma.userMemory.findMany({
          where: {
            userId,
            itemId: {
              in: definition.complements.map((item) => item.itemId),
            },
            repetitions: { gt: 0 },
          },
          orderBy: { updatedAt: 'desc' },
          select: { itemId: true },
        })
    const learnedItemIds = new Set(
      learnedMemories.map((memory) => memory.itemId),
    )
    const complements = dueComplement
      ? [dueComplement]
      : [
          ...definition.complements.filter((item) =>
            learnedItemIds.has(item.itemId),
          ),
          ...definition.complements.filter(
            (item) => !learnedItemIds.has(item.itemId),
          ),
        ]

    return categories.flatMap((category) =>
      definition.personKeys.flatMap((person) =>
        complements.map((complement) => ({
          category,
          person,
          complementKey: complement.key,
        })),
      ),
    )
  }

  private async assertMorphologicallyValid(targetText: string): Promise<void> {
    const analysis = await this.morphology.analyzeText(targetText)
    const unknownWords = analysis.tokens.filter(
      (token) => token.type === 'word' && token.analyses.length === 0,
    )
    if (unknownWords.length > 0) {
      throw new Error(
        `Generated Finnish exercise contains unknown words: ${unknownWords
          .map((token) => token.surface)
          .join(', ')}`,
      )
    }
  }

  private mapExercise(
    exercise: GeneratedCandidateRecord,
    sourceLanguage: string,
    dueItemIds: string[],
  ): PreparedReviewExerciseResponse | null {
    const prompt = exercise.prompts[0]
    if (!exercise.lessonId || !prompt || exercise.items.length === 0)
      return null
    const dueSet = new Set(dueItemIds)
    return {
      id: exercise.id,
      lessonId: exercise.lessonId,
      sourceLanguage,
      targetLanguage: exercise.targetLanguage,
      prompt: prompt.text,
      reviewItemIds: exercise.items
        .filter((item) => dueSet.has(item.itemId))
        .map((item) => item.itemId),
    }
  }
}

function hashParameters(
  templateId: string,
  routeVersionId: string,
  parameters: FinnishIdentityParameters,
): string {
  return createHash('sha256')
    .update(
      JSON.stringify({
        templateId,
        routeVersionId,
        parameters,
        generatorVersion: GENERATOR_VERSION,
      }),
    )
    .digest('hex')
}

function firstDuePosition(
  items: Array<{ itemId: string }>,
  positions: Map<string, number>,
): number {
  return Math.min(
    ...items.map(
      (item) => positions.get(item.itemId) ?? Number.MAX_SAFE_INTEGER,
    ),
  )
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  )
}
