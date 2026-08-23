import type {
  UserVocabularyResponse,
  VocabularyStudyResponse,
} from '@language/contracts'
import {
  ContentStatus,
  KnowledgeItemKind,
  MemoryState,
} from '@language/database'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import { toLexicalFeatures, toLocalizedText } from '../common/content-mapper'
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
      include: {
        entries: {
          orderBy: [{ modulePosition: 'asc' }, { lessonPosition: 'asc' }],
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                knowledgeItems: {
                  where: { item: { kind: KnowledgeItemKind.LEXICAL_SENSE } },
                  orderBy: { position: 'asc' },
                  include: {
                    item: {
                      include: {
                        userMemories: { where: { userId }, take: 1 },
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
                },
              },
            },
          },
        },
      },
    })

    if (!route) {
      throw new NotFoundException(
        `Course route ${routeVersionId} was not found`,
      )
    }

    const now = new Date()
    const items = new Map<string, UserVocabularyResponse['items'][number]>()

    for (const entry of route.entries) {
      for (const lessonItem of entry.lesson.knowledgeItems) {
        const sense = lessonItem.item.lexicalSense
        if (!sense || items.has(lessonItem.itemId)) continue

        const memory = lessonItem.item.userMemories[0]
        items.set(lessonItem.itemId, {
          itemId: lessonItem.itemId,
          lexicalEntryId: sense.lexicalEntry.id,
          lemma: sense.lexicalEntry.lemma,
          partOfSpeech: sense.lexicalEntry.partOfSpeech,
          gloss: toLocalizedText(sense.gloss),
          forms: sense.lexicalEntry.forms.map((form) => ({
            id: form.id,
            surface: form.surface,
            features: toLexicalFeatures(form.features),
            audioUrl: this.media.resolve(form.audioAsset?.storageKey),
          })),
          status: sense.status,
          introducedIn: {
            lessonId: entry.lesson.id,
            title: toLocalizedText(entry.lesson.title),
          },
          memory: {
            state: memory?.state ?? 'NEW',
            dueAt: memory?.dueAt.toISOString() ?? null,
            isDue: Boolean(memory && memory.dueAt <= now),
            repetitions: memory?.repetitions ?? 0,
            lapses: memory?.lapses ?? 0,
          },
        })
      }
    }

    const vocabularyItems = [...items.values()]
    return {
      routeVersionId,
      totalCount: vocabularyItems.length,
      dueCount: vocabularyItems.filter((item) => item.memory.isDue).length,
      items: vocabularyItems,
    }
  }

  async addToLearning(
    userId: string,
    routeVersionId: string,
    itemId: string,
  ): Promise<VocabularyStudyResponse> {
    const item = await this.prisma.knowledgeItem.findFirst({
      where: {
        id: itemId,
        kind: KnowledgeItemKind.LEXICAL_SENSE,
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
      select: { id: true },
    })
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

    return {
      itemId,
      state: memory.state,
      dueAt: memory.dueAt.toISOString(),
      repetitions: memory.repetitions,
      lapses: memory.lapses,
    }
  }
}
