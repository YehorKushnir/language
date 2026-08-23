import { ContentStatus, MemoryState } from '@language/database'
import { NotFoundException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PrismaService } from '../database/prisma.service'
import { MediaUrlService } from '../media/media-url.service'
import { VocabularyService } from './vocabulary.service'

describe('VocabularyService', () => {
  const prisma = {
    courseRouteVersion: {
      findUnique: vi.fn(),
    },
    knowledgeItem: { findFirst: vi.fn(), findMany: vi.fn() },
    userMemory: { upsert: vi.fn() },
  }
  const media = { resolve: vi.fn(() => null) }
  const service = new VocabularyService(
    prisma as unknown as PrismaService,
    media as unknown as MediaUrlService,
  )

  beforeEach(() => {
    vi.clearAllMocks()
    prisma.knowledgeItem.findMany.mockResolvedValue([])
  })

  it('returns course words in route order with user memory', async () => {
    prisma.courseRouteVersion.findUnique.mockResolvedValue({
      entries: [
        {
          lesson: {
            id: 'lesson.1',
            title: { ru: 'Первый урок' },
            knowledgeItems: [
              {
                itemId: 'word.fi.opiskelija',
                item: {
                  userMemories: [
                    {
                      state: MemoryState.REVIEW,
                      dueAt: new Date('2020-01-01T00:00:00.000Z'),
                      repetitions: 2,
                      lapses: 1,
                    },
                  ],
                  lexicalSense: {
                    status: ContentStatus.CURATED,
                    gloss: { ru: 'студент' },
                    metadata: {
                      example: {
                        target: 'Hän on opiskelija.',
                        source: { ru: 'Он или она — студент.' },
                      },
                    },
                    lexicalEntry: {
                      id: 'lex.fi.opiskelija',
                      lemma: 'opiskelija',
                      partOfSpeech: 'noun',
                      forms: [
                        {
                          id: 'form.fi.opiskelija.nominative.sg',
                          surface: 'opiskelija',
                          features: {
                            case: 'nominative',
                            number: 'singular',
                          },
                        },
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      ],
    })

    await expect(
      service.getUserVocabulary('user.1', 'route.1'),
    ).resolves.toEqual({
      routeVersionId: 'route.1',
      totalCount: 1,
      dueCount: 1,
      items: [
        {
          itemId: 'word.fi.opiskelija',
          lexicalEntryId: 'lex.fi.opiskelija',
          lemma: 'opiskelija',
          partOfSpeech: 'noun',
          gloss: { ru: 'студент' },
          example: {
            target: 'Hän on opiskelija.',
            source: { ru: 'Он или она — студент.' },
          },
          forms: [
            {
              id: 'form.fi.opiskelija.nominative.sg',
              surface: 'opiskelija',
              features: { case: 'nominative', number: 'singular' },
              audioUrl: null,
            },
          ],
          status: ContentStatus.CURATED,
          introducedIn: {
            kind: 'lesson',
            lessonId: 'lesson.1',
            title: { ru: 'Первый урок' },
          },
          memory: {
            state: MemoryState.REVIEW,
            dueAt: '2020-01-01T00:00:00.000Z',
            isDue: true,
            repetitions: 2,
            lapses: 1,
          },
        },
      ],
    })
  })

  it('rejects an unknown route', async () => {
    prisma.courseRouteVersion.findUnique.mockResolvedValue(null)

    await expect(
      service.getUserVocabulary('user.1', 'route.missing'),
    ).rejects.toBeInstanceOf(NotFoundException)
  })

  it('adds a route word to learning without recording a fake review', async () => {
    prisma.knowledgeItem.findFirst.mockResolvedValue({
      id: 'word.fi.opiskelija',
    })
    prisma.userMemory.upsert.mockResolvedValue({
      itemId: 'word.fi.opiskelija',
      state: MemoryState.NEW,
      dueAt: new Date('2026-08-23T00:00:00.000Z'),
      repetitions: 0,
      lapses: 0,
    })

    await expect(
      service.addToLearning('user.1', 'route.1', 'word.fi.opiskelija'),
    ).resolves.toEqual({
      itemId: 'word.fi.opiskelija',
      state: MemoryState.NEW,
      dueAt: '2026-08-23T00:00:00.000Z',
      repetitions: 0,
      lapses: 0,
    })
    expect(prisma.userMemory.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: {},
        create: expect.objectContaining({
          difficulty: 0,
          stability: 0,
          state: MemoryState.NEW,
        }),
      }),
    )
  })
})
