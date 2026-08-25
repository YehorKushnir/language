import {
  ContentStatus,
  KnowledgeItemKind,
  MemoryState,
} from '@language/database'
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
    userMemory: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
  }
  const media = { resolve: vi.fn(() => null) }
  const service = new VocabularyService(
    prisma as unknown as PrismaService,
    media as unknown as MediaUrlService,
  )

  beforeEach(() => {
    vi.clearAllMocks()
    prisma.knowledgeItem.findMany.mockResolvedValue([])
    prisma.userMemory.findMany.mockResolvedValue([])
  })

  it('returns only words already added to the user vocabulary', async () => {
    prisma.courseRouteVersion.findUnique.mockResolvedValue({
      courseId: 'course.ru-fi',
    })
    prisma.userMemory.findMany.mockResolvedValue([
      {
        userId: 'user.1',
        itemId: 'word.fi.opiskelija',
        state: MemoryState.REVIEW,
        dueAt: new Date('2020-01-01T00:00:00.000Z'),
        repetitions: 2,
        lapses: 1,
        item: {
          lessonItems: [
            {
              lesson: {
                id: 'lesson.1',
                title: { ru: 'Первый урок' },
              },
            },
          ],
          textItems: [],
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
                  id: 'form.fi.opiskelija.10',
                  surface: 'opiskelijana',
                  features: { case: 'essive', number: 'singular' },
                },
                {
                  id: 'form.fi.opiskelija.2',
                  surface: 'opiskelijan',
                  features: { case: 'genitive', number: 'singular' },
                },
                {
                  id: 'form.fi.opiskelija.1',
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
    ])

    await expect(
      service.getUserVocabulary('user.1', 'route.1'),
    ).resolves.toEqual({
      routeVersionId: 'route.1',
      totalCount: 1,
      dueCount: 1,
      counts: { all: 1, due: 1, new: 0, learning: 0, review: 1 },
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
              id: 'form.fi.opiskelija.1',
              surface: 'opiskelija',
              features: { case: 'nominative', number: 'singular' },
              audioUrl: null,
            },
            {
              id: 'form.fi.opiskelija.2',
              surface: 'opiskelijan',
              features: { case: 'genitive', number: 'singular' },
              audioUrl: null,
            },
            {
              id: 'form.fi.opiskelija.10',
              surface: 'opiskelijana',
              features: { case: 'essive', number: 'singular' },
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
      grammarCounts: { all: 0, due: 0, new: 0, learning: 0, review: 0 },
      grammarItems: [],
    })
    expect(prisma.userMemory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user.1' }),
      }),
    )
  })

  it('does not expose untouched course words', async () => {
    prisma.courseRouteVersion.findUnique.mockResolvedValue({
      courseId: 'course.ru-fi',
    })

    await expect(
      service.getUserVocabulary('user.1', 'route.1'),
    ).resolves.toEqual({
      routeVersionId: 'route.1',
      totalCount: 0,
      dueCount: 0,
      counts: { all: 0, due: 0, new: 0, learning: 0, review: 0 },
      items: [],
      grammarCounts: { all: 0, due: 0, new: 0, learning: 0, review: 0 },
      grammarItems: [],
    })
  })

  it('returns a grammar skill after practice created its memory', async () => {
    prisma.courseRouteVersion.findUnique.mockResolvedValue({
      courseId: 'course.ru-fi',
    })
    prisma.userMemory.findMany.mockResolvedValue([
      {
        userId: 'user.1',
        itemId: 'grammar.fi.present.common',
        state: MemoryState.RELEARNING,
        dueAt: new Date('2020-01-01T00:00:00.000Z'),
        repetitions: 3,
        lapses: 2,
        item: {
          kind: KnowledgeItemKind.GRAMMAR,
          lessonItems: [
            {
              lesson: {
                id: 'fi.present.common',
                title: { ru: 'Настоящее время' },
              },
            },
          ],
          textItems: [],
          lexicalSense: null,
          skill: {
            name: { ru: 'Настоящее время частых глаголов' },
            description: {
              ru: 'Личные формы глагола и согласование с подлежащим.',
            },
          },
        },
      },
    ])

    await expect(
      service.getUserVocabulary('user.1', 'route.1'),
    ).resolves.toEqual({
      routeVersionId: 'route.1',
      totalCount: 1,
      dueCount: 1,
      counts: { all: 0, due: 0, new: 0, learning: 0, review: 0 },
      items: [],
      grammarCounts: { all: 1, due: 1, new: 0, learning: 1, review: 0 },
      grammarItems: [
        {
          itemId: 'grammar.fi.present.common',
          kind: KnowledgeItemKind.GRAMMAR,
          name: { ru: 'Настоящее время частых глаголов' },
          description: {
            ru: 'Личные формы глагола и согласование с подлежащим.',
          },
          introducedIn: {
            kind: 'lesson',
            lessonId: 'fi.present.common',
            title: { ru: 'Настоящее время' },
          },
          memory: {
            state: MemoryState.RELEARNING,
            dueAt: '2020-01-01T00:00:00.000Z',
            isDue: true,
            repetitions: 3,
            lapses: 2,
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

  it('schedules a reviewed text word from a flashcard fallback', async () => {
    prisma.knowledgeItem.findFirst.mockResolvedValue({
      id: 'word.fi.reader.aamu',
    })
    prisma.userMemory.findUnique.mockResolvedValue({
      userId: 'user.1',
      itemId: 'word.fi.reader.aamu',
      difficulty: 0,
      stability: 0,
      state: MemoryState.NEW,
      dueAt: new Date('2026-08-23T00:00:00.000Z'),
      lastReviewAt: null,
      elapsedDays: 0,
      scheduledDays: 0,
      learningSteps: 0,
      repetitions: 0,
      lapses: 0,
    })
    prisma.userMemory.update.mockImplementation(({ data }) =>
      Promise.resolve({ itemId: 'word.fi.reader.aamu', ...data }),
    )

    const result = await service.reviewItem(
      'user.1',
      'route.1',
      'word.fi.reader.aamu',
      'SUCCESS',
    )

    expect(result).toMatchObject({
      itemId: 'word.fi.reader.aamu',
      state: MemoryState.REVIEW,
      repetitions: 1,
      lapses: 0,
    })
    expect(prisma.userMemory.update).toHaveBeenCalledOnce()
  })
})
