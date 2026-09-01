import {
  ContentStatus,
  KnowledgeItemKind,
  MemoryState,
} from '@language/database'
import { NotFoundException } from '@nestjs/common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

  afterEach(() => {
    vi.useRealTimers()
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
        lastReviewAt: new Date('2026-08-01T00:00:00.000Z'),
        elapsedDays: 0,
        scheduledDays: 60,
        difficulty: 5,
        stability: 60,
        learningSteps: 0,
        repetitions: 2,
        lapses: 1,
        manuallyKnown: true,
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
      counts: { all: 1, due: 1, learning: 0, learned: 1 },
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
            status: 'LEARNED',
            progressPercent: 100,
            dueAt: '2020-01-01T00:00:00.000Z',
            isDue: true,
            repetitions: 2,
            lapses: 1,
          },
        },
      ],
      grammarCounts: { all: 0, due: 0, learning: 0, learned: 0 },
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
      counts: { all: 0, due: 0, learning: 0, learned: 0 },
      items: [],
      grammarCounts: { all: 0, due: 0, learning: 0, learned: 0 },
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
        lastReviewAt: new Date('2026-08-01T00:00:00.000Z'),
        elapsedDays: 60,
        scheduledDays: 0,
        difficulty: 5,
        stability: 1,
        learningSteps: 1,
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
      counts: { all: 0, due: 0, learning: 0, learned: 0 },
      items: [],
      grammarCounts: { all: 1, due: 1, learning: 1, learned: 0 },
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
            status: 'LEARNING',
            progressPercent: 0,
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

  it('adds a text word through the same initialized memory flow', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-26T12:00:00.000Z'))
    prisma.knowledgeItem.findFirst.mockResolvedValue({
      id: 'word.fi.reader.aamu',
    })
    prisma.userMemory.upsert.mockImplementation(({ create }) =>
      Promise.resolve(create),
    )

    await expect(
      service.addToLearning('user.1', 'route.1', 'word.fi.reader.aamu'),
    ).resolves.toEqual({
      itemId: 'word.fi.reader.aamu',
      state: MemoryState.NEW,
      dueAt: '2026-08-26T12:20:00.000Z',
      repetitions: 0,
      lapses: 0,
    })
    expect(prisma.userMemory.upsert).toHaveBeenCalledWith({
      where: {
        userId_itemId: {
          userId: 'user.1',
          itemId: 'word.fi.reader.aamu',
        },
      },
      update: {},
      create: expect.objectContaining({
        dueAt: new Date('2026-08-26T12:20:00.000Z'),
        repetitions: 0,
      }),
    })
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

  it('does not schedule an early flashcard answer', async () => {
    prisma.knowledgeItem.findFirst.mockResolvedValue({
      id: 'word.fi.reader.aamu',
    })
    prisma.userMemory.findUnique.mockResolvedValue({
      userId: 'user.1',
      itemId: 'word.fi.reader.aamu',
      difficulty: 5,
      stability: 8,
      state: MemoryState.REVIEW,
      dueAt: new Date('2099-01-01T00:00:00.000Z'),
      lastReviewAt: new Date('2026-08-01T00:00:00.000Z'),
      elapsedDays: 0,
      scheduledDays: 8,
      learningSteps: 0,
      repetitions: 4,
      lapses: 0,
    })

    await expect(
      service.reviewItem('user.1', 'route.1', 'word.fi.reader.aamu', 'SUCCESS'),
    ).resolves.toMatchObject({
      state: MemoryState.REVIEW,
      dueAt: '2099-01-01T00:00:00.000Z',
      repetitions: 4,
    })
    expect(prisma.userMemory.update).not.toHaveBeenCalled()
  })

  it('preserves a manual known override when a scheduled review is recorded', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-26T12:00:00.000Z'))
    prisma.knowledgeItem.findFirst.mockResolvedValue({
      id: 'word.fi.reader.aamu',
    })
    prisma.userMemory.findUnique.mockResolvedValue({
      userId: 'user.1',
      itemId: 'word.fi.reader.aamu',
      difficulty: 5,
      stability: 60,
      state: MemoryState.REVIEW,
      dueAt: new Date('2026-08-26T12:00:00.000Z'),
      lastReviewAt: new Date('2026-06-27T12:00:00.000Z'),
      elapsedDays: 0,
      scheduledDays: 60,
      learningSteps: 0,
      repetitions: 1,
      lapses: 0,
      manuallyKnown: true,
    })
    prisma.userMemory.update.mockImplementation(({ data }) =>
      Promise.resolve({
        itemId: 'word.fi.reader.aamu',
        manuallyKnown: true,
        ...data,
      }),
    )

    await service.reviewItem(
      'user.1',
      'route.1',
      'word.fi.reader.aamu',
      'FAILURE',
    )

    expect(prisma.userMemory.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ manuallyKnown: expect.anything() }),
      }),
    )
  })

  it('manually returns a mature word to active learning', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-26T12:00:00.000Z'))
    prisma.knowledgeItem.findFirst.mockResolvedValue({
      id: 'word.fi.opiskelija',
    })
    prisma.userMemory.findUnique.mockResolvedValue({
      userId: 'user.1',
      itemId: 'word.fi.opiskelija',
      difficulty: 5,
      stability: 90,
      state: MemoryState.REVIEW,
      dueAt: new Date('2026-11-01T00:00:00.000Z'),
      lastReviewAt: new Date('2026-08-01T00:00:00.000Z'),
      elapsedDays: 0,
      scheduledDays: 90,
      learningSteps: 0,
      repetitions: 9,
      lapses: 1,
    })
    prisma.userMemory.upsert.mockImplementation(({ update }) =>
      Promise.resolve({ itemId: 'word.fi.opiskelija', ...update }),
    )

    await expect(
      service.changeMemoryStatus(
        'user.1',
        'route.1',
        'word.fi.opiskelija',
        'LEARNING',
      ),
    ).resolves.toEqual({
      itemId: 'word.fi.opiskelija',
      state: MemoryState.LEARNING,
      dueAt: '2026-08-26T12:10:00.000Z',
      repetitions: 1,
      lapses: 0,
    })
    expect(prisma.userMemory.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          state: MemoryState.LEARNING,
          dueAt: new Date('2026-08-26T12:10:00.000Z'),
          repetitions: 1,
          manuallyKnown: false,
        }),
      }),
    )
  })

  it('restores the exact progress saved before a manual known status', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-26T12:00:00.000Z'))
    prisma.knowledgeItem.findFirst.mockResolvedValue({
      id: 'word.fi.opiskelija',
    })
    const initial = {
      userId: 'user.1',
      itemId: 'word.fi.opiskelija',
      difficulty: 0,
      stability: 0,
      state: MemoryState.NEW,
      dueAt: new Date('2026-08-26T12:20:00.000Z'),
      lastReviewAt: null,
      elapsedDays: 0,
      scheduledDays: 0,
      learningSteps: 0,
      repetitions: 0,
      lapses: 0,
      manuallyKnown: false,
      manualStatusSnapshot: null,
    }
    let persisted = initial
    prisma.userMemory.findUnique.mockImplementation(() =>
      Promise.resolve(persisted),
    )
    prisma.userMemory.upsert.mockImplementation(({ update }) => {
      persisted = { ...persisted, ...update }
      return Promise.resolve(persisted)
    })

    const changed = await service.changeMemoryStatus(
      'user.1',
      'route.1',
      'word.fi.opiskelija',
      'KNOWN',
    )
    expect(changed).toEqual({
      itemId: 'word.fi.opiskelija',
      state: MemoryState.REVIEW,
      dueAt: '2026-10-25T12:00:00.000Z',
      repetitions: 1,
      lapses: 0,
    })
    expect(prisma.userMemory.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          manuallyKnown: true,
          manualStatusSnapshot: expect.any(String),
        }),
      }),
    )

    const restored = await service.changeMemoryStatus(
      'user.1',
      'route.1',
      'word.fi.opiskelija',
      'LEARNING',
    )
    expect(restored).toEqual({
      itemId: 'word.fi.opiskelija',
      state: MemoryState.NEW,
      dueAt: '2026-08-26T12:20:00.000Z',
      repetitions: 0,
      lapses: 0,
    })
    expect(persisted).toMatchObject({
      difficulty: 0,
      stability: 0,
      state: MemoryState.NEW,
      dueAt: new Date('2026-08-26T12:20:00.000Z'),
      lastReviewAt: null,
      elapsedDays: 0,
      scheduledDays: 0,
      learningSteps: 0,
      repetitions: 0,
      lapses: 0,
      manuallyKnown: false,
      manualStatusSnapshot: null,
    })
  })

  it('does not reset legacy manual progress when no snapshot exists', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-26T12:00:00.000Z'))
    prisma.knowledgeItem.findFirst.mockResolvedValue({
      id: 'word.fi.opiskelija',
    })
    const existing = {
      userId: 'user.1',
      itemId: 'word.fi.opiskelija',
      difficulty: 4,
      stability: 60,
      state: MemoryState.REVIEW,
      dueAt: new Date('2026-10-25T12:00:00.000Z'),
      lastReviewAt: new Date('2026-08-26T12:00:00.000Z'),
      elapsedDays: 0,
      scheduledDays: 60,
      learningSteps: 0,
      repetitions: 3,
      lapses: 1,
      manuallyKnown: true,
      manualStatusSnapshot: null,
    }
    prisma.userMemory.findUnique.mockResolvedValue(existing)
    prisma.userMemory.upsert.mockImplementation(({ update }) =>
      Promise.resolve({ ...existing, ...update }),
    )

    await expect(
      service.changeMemoryStatus(
        'user.1',
        'route.1',
        'word.fi.opiskelija',
        'LEARNING',
      ),
    ).resolves.toEqual({
      itemId: 'word.fi.opiskelija',
      state: MemoryState.REVIEW,
      dueAt: '2026-10-25T12:00:00.000Z',
      repetitions: 3,
      lapses: 1,
    })
    expect(prisma.userMemory.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          state: MemoryState.REVIEW,
          repetitions: 3,
          lapses: 1,
          manuallyKnown: false,
          manualStatusSnapshot: null,
        }),
      }),
    )
  })
})
