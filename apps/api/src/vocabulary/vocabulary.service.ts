import type {
  UserVocabularyResponse,
  VocabularyStudyResponse,
} from '@language/contracts'
import {
  ContentStatus,
  KnowledgeItemKind,
  MemoryState,
} from '@language/database'
import { scheduleReview } from '@language/domain'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import {
  toLexicalFeatures,
  toLocalizedText,
  toVocabularyExample,
} from '../common/content-mapper'
import { PrismaService } from '../database/prisma.service'
import { MediaUrlService } from '../media/media-url.service'

@Injectable()
export class VocabularyService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MediaUrlService) private readonly media: MediaUrlService,
  ) {}

  async getUserVocabulary(
    userId: string,
    routeVersionId: string,
  ): Promise<UserVocabularyResponse> {
    const route = await this.prisma.courseRouteVersion.findUnique({
      where: { id: routeVersionId, status: ContentStatus.CURATED },
      select: { courseId: true },
    })

    if (!route) {
      throw new NotFoundException(
        `Course route ${routeVersionId} was not found`,
      )
    }

    const memories = await this.prisma.userMemory.findMany({
      where: {
        userId,
        item: {
          kind: KnowledgeItemKind.LEXICAL_SENSE,
          OR: [
            {
              lessonItems: {
                some: {
                  lesson: {
                    status: ContentStatus.CURATED,
                    routeEntries: { some: { routeVersionId } },
                  },
                },
              },
            },
            {
              textItems: {
                some: {
                  text: {
                    courseId: route.courseId,
                    status: ContentStatus.CURATED,
                  },
                },
              },
            },
          ],
        },
      },
      include: {
        item: {
          include: {
            lessonItems: {
              where: {
                lesson: {
                  status: ContentStatus.CURATED,
                  routeEntries: { some: { routeVersionId } },
                },
              },
              orderBy: { lessonId: 'asc' },
              take: 1,
              include: {
                lesson: { select: { id: true, title: true } },
              },
            },
            textItems: {
              where: {
                text: {
                  courseId: route.courseId,
                  status: ContentStatus.CURATED,
                },
              },
              orderBy: { textId: 'asc' },
              take: 1,
              include: { text: { select: { id: true, title: true } } },
            },
            lexicalSense: {
              include: {
                lexicalEntry: {
                  include: {
                    forms: {
                      orderBy: { id: 'asc' },
                      include: { audioAsset: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    const now = new Date()
    const items = memories.flatMap<UserVocabularyResponse['items'][number]>(
      (memory) => {
        const sense = memory.item.lexicalSense
        const lesson = memory.item.lessonItems[0]?.lesson
        const text = memory.item.textItems[0]?.text
        if (!sense || (!lesson && !text)) return []

        return [
          {
            itemId: memory.itemId,
            lexicalEntryId: sense.lexicalEntry.id,
            lemma: sense.lexicalEntry.lemma,
            partOfSpeech: sense.lexicalEntry.partOfSpeech,
            gloss: toLocalizedText(sense.gloss),
            example: toVocabularyExample(sense.metadata),
            forms: sense.lexicalEntry.forms
              .map((form) => ({
                id: form.id,
                surface: form.surface,
                features: toLexicalFeatures(form.features),
                audioUrl: this.media.resolve(form.audioAsset?.storageKey),
              }))
              .sort(compareVocabularyForms),
            status: sense.status,
            introducedIn: lesson
              ? {
                  kind: 'lesson',
                  lessonId: lesson.id,
                  title: toLocalizedText(lesson.title),
                }
              : {
                  kind: 'text',
                  textId: text!.id,
                  title: toLocalizedText(text!.title),
                },
            memory: {
              state: memory.state,
              dueAt: memory.dueAt.toISOString(),
              isDue: memory.dueAt <= now,
              repetitions: memory.repetitions,
              lapses: memory.lapses,
            },
          },
        ]
      },
    )
    items.sort((left, right) =>
      left.lemma.localeCompare(right.lemma, 'fi', { sensitivity: 'base' }),
    )

    const counts = {
      all: items.length,
      due: items.filter((item) => item.memory.isDue).length,
      new: items.filter((item) => item.memory.state === MemoryState.NEW).length,
      learning: items.filter(
        (item) =>
          item.memory.state === MemoryState.LEARNING ||
          item.memory.state === MemoryState.RELEARNING,
      ).length,
      review: items.filter((item) => item.memory.state === MemoryState.REVIEW)
        .length,
    }
    return {
      routeVersionId,
      totalCount: counts.all,
      dueCount: counts.due,
      counts,
      items,
    }
  }

  async addToLearning(
    userId: string,
    routeVersionId: string,
    itemId: string,
  ): Promise<VocabularyStudyResponse> {
    const item = await this.findRouteVocabularyItem(routeVersionId, itemId)
    if (!item) {
      throw new NotFoundException(
        `Vocabulary item ${itemId} is not part of route ${routeVersionId}`,
      )
    }

    const memory = await this.prisma.userMemory.upsert({
      where: { userId_itemId: { userId, itemId } },
      update: {},
      create: {
        userId,
        itemId,
        difficulty: 0,
        stability: 0,
        state: MemoryState.NEW,
        dueAt: new Date(),
      },
    })

    return toStudyResponse(memory)
  }

  async reviewItem(
    userId: string,
    routeVersionId: string,
    itemId: string,
    result: 'SUCCESS' | 'FAILURE',
  ): Promise<VocabularyStudyResponse> {
    const item = await this.findRouteVocabularyItem(routeVersionId, itemId)
    if (!item) {
      throw new NotFoundException(
        `Vocabulary item ${itemId} is not part of route ${routeVersionId}`,
      )
    }

    const existing = await this.prisma.userMemory.findUnique({
      where: { userId_itemId: { userId, itemId } },
    })
    if (!existing) {
      throw new NotFoundException(
        `Vocabulary item ${itemId} has not been added to learning`,
      )
    }

    const schedule = scheduleReview(
      {
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
      },
      result,
      new Date(),
    )
    const memory = await this.prisma.userMemory.update({
      where: { userId_itemId: { userId, itemId } },
      data: {
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
      },
    })

    return toStudyResponse(memory)
  }

  private findRouteVocabularyItem(routeVersionId: string, itemId: string) {
    return this.prisma.knowledgeItem.findFirst({
      where: {
        id: itemId,
        kind: KnowledgeItemKind.LEXICAL_SENSE,
        OR: [
          {
            lessonItems: {
              some: {
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
            },
          },
          {
            textItems: {
              some: {
                text: {
                  status: ContentStatus.CURATED,
                  course: {
                    routeVersions: {
                      some: {
                        id: routeVersionId,
                        status: ContentStatus.CURATED,
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
      select: { id: true },
    })
  }
}

function toStudyResponse(memory: {
  itemId: string
  state: MemoryState
  dueAt: Date
  repetitions: number
  lapses: number
}): VocabularyStudyResponse {
  return {
    itemId: memory.itemId,
    state: memory.state,
    dueAt: memory.dueAt.toISOString(),
    repetitions: memory.repetitions,
    lapses: memory.lapses,
  }
}

const caseOrder = new Map(
  [
    'nominative',
    'genitive',
    'accusative',
    'partitive',
    'essive',
    'translative',
    'inessive',
    'elative',
    'illative',
    'adessive',
    'ablative',
    'allative',
    'abessive',
    'instructive',
    'comitative',
  ].map((value, index) => [value, index]),
)

const comparisonOrder = new Map(
  ['positive', 'comparative', 'superlative'].map((value, index) => [
    value,
    index,
  ]),
)

const personOrder = new Map(
  ['first', 'second', 'third'].map((value, index) => [value, index]),
)

function compareVocabularyForms(
  left: UserVocabularyResponse['items'][number]['forms'][number],
  right: UserVocabularyResponse['items'][number]['forms'][number],
) {
  const leftHasCase = typeof left.features.case === 'string'
  const rightHasCase = typeof right.features.case === 'string'
  if (leftHasCase || rightHasCase) {
    const comparisonDifference =
      getFeatureOrder(comparisonOrder, left.features.comparison, 0) -
      getFeatureOrder(comparisonOrder, right.features.comparison, 0)
    if (comparisonDifference !== 0) return comparisonDifference

    const numberDifference =
      getNumberOrder(left.features.number) -
      getNumberOrder(right.features.number)
    if (numberDifference !== 0) return numberDifference

    const caseDifference =
      getFeatureOrder(caseOrder, left.features.case) -
      getFeatureOrder(caseOrder, right.features.case)
    return caseDifference || left.id.localeCompare(right.id)
  }

  const categoryDifference =
    getVerbFormOrder(left.features) - getVerbFormOrder(right.features)
  if (categoryDifference !== 0) return categoryDifference

  const numberDifference =
    getNumberOrder(left.features.number) - getNumberOrder(right.features.number)
  if (numberDifference !== 0) return numberDifference

  const personDifference =
    getFeatureOrder(personOrder, left.features.person) -
    getFeatureOrder(personOrder, right.features.person)
  return personDifference || left.id.localeCompare(right.id)
}

function getFeatureOrder(
  order: Map<string, number>,
  value: unknown,
  fallback = Number.MAX_SAFE_INTEGER,
) {
  return order.get(String(value)) ?? fallback
}

function getNumberOrder(value: unknown) {
  if (value === 'singular') return 0
  if (value === 'plural') return 1
  return 2
}

function getVerbFormOrder(features: Record<string, unknown>) {
  const form = features.form
  const voice = features.voice
  const mood = features.mood
  const tense = features.tense

  if (form === 'infinitive') return 0
  if (voice === 'active' && mood === 'indicative' && tense === 'present') {
    return 10
  }
  if (voice === 'active' && mood === 'indicative' && tense === 'imperfect') {
    return 20
  }
  if (voice === 'active' && mood === 'conditional') return 30
  if (voice === 'active' && mood === 'imperative') return 40
  if (form === 'connegative') return 45
  if (voice === 'passive' && mood === 'indicative' && tense === 'present') {
    return 50
  }
  if (voice === 'passive' && mood === 'indicative' && tense === 'imperfect') {
    return 51
  }
  if (voice === 'passive' && mood === 'conditional') return 52
  if (voice === 'passive' && mood === 'imperative') return 53
  if (form === 'present_participle' && voice !== 'passive') return 60
  if (form === 'present_participle') return 61
  if (form === 'past_participle' && voice !== 'passive') return 62
  if (form === 'past_participle') return 63
  if (form === 'agent_participle') return 64
  if (form === 'negative_participle') return 65
  return 99
}
