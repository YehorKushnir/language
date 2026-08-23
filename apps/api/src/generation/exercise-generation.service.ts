import { createHash } from 'node:crypto'

import type { PreparedReviewExerciseResponse } from '@language/contracts'
import {
  ContentStatus,
  ExerciseItemRole,
  ExerciseKind,
  Prisma,
} from '@language/database'
import {
  finnishTemplateSupportedItemIds,
  realizeFinnishIdentity,
  realizeFinnishPreparedVariation,
  validateFinnishExerciseTemplate,
  type FinnishExerciseTemplateDefinition,
  type FinnishIdentityCategory,
  type FinnishIdentityParameters,
  type FinnishIdentityTemplateDefinition,
  type FinnishPreparedVariationParameters,
  type FinnishPreparedVariationSlot,
  type FinnishPreparedVariationTemplateDefinition,
} from '@language/language-fi'
import { Inject, Injectable } from '@nestjs/common'

import { PrismaService } from '../database/prisma.service'
import { FinnishMorphologyService } from '../morphology/finnish-morphology.service'

const IDENTITY_GENERATOR_VERSION = 'finnish-identity-v1'
const PREPARED_VARIATION_GENERATOR_VERSION = 'finnish-prepared-variation-v1'
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

interface ExerciseTemplateRecord {
  id: string
  courseId: string
  definition: FinnishExerciseTemplateDefinition
}

interface PreparedSourceRecord {
  id: string
  lessonId: string | null
  targetText: string
  answerSpec: unknown
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

    const templates = await this.prisma.exerciseTemplate.findMany({
      where: {
        status: ContentStatus.CURATED,
        course: {
          routeVersions: {
            some: { id: routeVersionId, status: ContentStatus.CURATED },
          },
        },
      },
      orderBy: [{ version: 'desc' }, { id: 'asc' }],
      select: { id: true, courseId: true, definition: true },
    })
    const template = templates.find((candidate) => {
      validateFinnishExerciseTemplate(candidate.definition)
      return (
        candidate.definition.sourceLanguage === sourceLanguage &&
        finnishTemplateSupportedItemIds(candidate.definition).includes(
          primaryDueItemId,
        )
      )
    })
    if (!template) return null

    validateFinnishExerciseTemplate(template.definition)
    const definition = template.definition
    if (definition.frame === 'prepared-variation') {
      return this.getOrCreatePreparedVariation(
        { id: template.id, courseId: template.courseId, definition },
        definition,
        routeVersionId,
        sourceLanguage,
        dueItemIds,
        excludedExerciseIds,
      )
    }

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
        IDENTITY_GENERATOR_VERSION,
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
              generatorVersion: IDENTITY_GENERATOR_VERSION,
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
                generatorVersion: IDENTITY_GENERATOR_VERSION,
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

  private async getOrCreatePreparedVariation(
    template: ExerciseTemplateRecord,
    definition: FinnishPreparedVariationTemplateDefinition,
    routeVersionId: string,
    sourceLanguage: string,
    dueItemIds: string[],
    excludedExerciseIds: string[],
  ): Promise<PreparedReviewExerciseResponse | null> {
    const primaryDueItemId = dueItemIds[0]
    if (!primaryDueItemId) return null

    const sources = await this.prisma.exercise.findMany({
      where: {
        id: { in: definition.exerciseIds },
        lessonId: definition.lessonId,
        kind: ExerciseKind.PREPARED,
        status: ContentStatus.CURATED,
        prompts: { some: { sourceLanguage } },
        items: {
          some: {
            itemId: primaryDueItemId,
            role: {
              in: [ExerciseItemRole.PRIMARY, ExerciseItemRole.SECONDARY],
            },
          },
        },
      },
      include: {
        prompts: { where: { sourceLanguage }, take: 1 },
        items: true,
      },
    })
    const duePosition = new Map(
      dueItemIds.map((itemId, index) => [itemId, index]),
    )
    const orderedSources = (sources as PreparedSourceRecord[]).sort(
      (left, right) =>
        firstDuePosition(left.items, duePosition) -
          firstDuePosition(right.items, duePosition) ||
        left.id.localeCompare(right.id),
    )

    for (const source of orderedSources) {
      const prompt = source.prompts[0]
      const answerSpec = readPreparedAnswerSpec(source.answerSpec)
      if (!prompt || !source.lessonId || !answerSpec) continue

      for (const variantIndex of preferredVariantIndexes(
        answerSpec.acceptedVariants,
        source.targetText,
      )) {
        const parameters: FinnishPreparedVariationParameters = {
          exerciseId: source.id,
          variantIndex,
        }
        const parametersHash = hashParameters(
          template.id,
          routeVersionId,
          parameters,
          PREPARED_VARIATION_GENERATOR_VERSION,
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

        const realization = realizeFinnishPreparedVariation(
          definition,
          {
            exerciseId: source.id,
            prompt: prompt.text,
            targetText: source.targetText,
            acceptedVariants: answerSpec.acceptedVariants,
            slots: answerSpec.slots,
          },
          parameters,
        )
        await this.assertMorphologicallyValid(realization.targetText)

        const testedItems = source.items.filter(
          (item) => item.role !== ExerciseItemRole.CONTEXT,
        )
        const primaryItemId = [...testedItems].sort(
          (left, right) =>
            (duePosition.get(left.itemId) ?? Number.MAX_SAFE_INTEGER) -
              (duePosition.get(right.itemId) ?? Number.MAX_SAFE_INTEGER) ||
            left.itemId.localeCompare(right.itemId),
        )[0]?.itemId
        if (!primaryItemId) continue

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
                parameters,
                sourceExerciseId: realization.sourceExerciseId,
                generatorVersion: PREPARED_VARIATION_GENERATOR_VERSION,
              } as unknown as Prisma.InputJsonValue,
              prompts: {
                create: {
                  sourceLanguage: definition.sourceLanguage,
                  text: realization.prompt,
                },
              },
              items: {
                create: source.items.map((item) => ({
                  itemId: item.itemId,
                  role:
                    item.role === ExerciseItemRole.CONTEXT
                      ? ExerciseItemRole.CONTEXT
                      : item.itemId === primaryItemId
                        ? ExerciseItemRole.PRIMARY
                        : ExerciseItemRole.SECONDARY,
                  testedFeatures:
                    parameters as unknown as Prisma.InputJsonValue,
                })),
              },
              generated: {
                create: {
                  templateId: template.id,
                  routeVersionId,
                  parametersHash,
                  generatorVersion: PREPARED_VARIATION_GENERATOR_VERSION,
                },
              },
            },
            include: {
              prompts: { where: { sourceLanguage }, take: 1 },
              items: { where: { itemId: { in: dueItemIds } } },
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
          if (winner) {
            return this.mapExercise(winner, sourceLanguage, dueItemIds)
          }
        }
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
  parameters: FinnishIdentityParameters | FinnishPreparedVariationParameters,
  generatorVersion: string,
): string {
  return createHash('sha256')
    .update(
      JSON.stringify({
        templateId,
        routeVersionId,
        parameters,
        generatorVersion,
      }),
    )
    .digest('hex')
}

function readPreparedAnswerSpec(value: unknown): {
  acceptedVariants: string[]
  slots: FinnishPreparedVariationSlot[]
} | null {
  if (!isRecord(value)) return null
  const acceptedVariants = value.acceptedVariants
  const slots = value.slots
  if (
    !Array.isArray(acceptedVariants) ||
    acceptedVariants.length === 0 ||
    !acceptedVariants.every((item) => typeof item === 'string' && item) ||
    !Array.isArray(slots) ||
    !slots.every(isPreparedVariationSlot)
  ) {
    return null
  }
  return { acceptedVariants, slots }
}

function isPreparedVariationSlot(
  value: unknown,
): value is FinnishPreparedVariationSlot {
  if (!isRecord(value)) return false
  return (
    typeof value.role === 'string' &&
    Array.isArray(value.accepted) &&
    value.accepted.every((item) => typeof item === 'string' && item) &&
    Array.isArray(value.itemIds) &&
    value.itemIds.every((item) => typeof item === 'string' && item) &&
    (value.optional === undefined || typeof value.optional === 'boolean')
  )
}

function preferredVariantIndexes(
  acceptedVariants: string[],
  preparedTarget: string,
): number[] {
  return acceptedVariants
    .map((_, index) => index)
    .sort(
      (left, right) =>
        Number(acceptedVariants[left] === preparedTarget) -
          Number(acceptedVariants[right] === preparedTarget) || left - right,
    )
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
