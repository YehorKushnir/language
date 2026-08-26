import { ContentStatus, ExerciseItemRole } from '@language/database'
import { NotFoundException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PrismaService } from '../database/prisma.service'
import { ExerciseGenerationService } from '../generation/exercise-generation.service'
import { ReviewQueueService } from './review-queue.service'

describe('ReviewQueueService', () => {
  const prisma = {
    courseRouteVersion: { findUnique: vi.fn() },
    userMemory: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
    },
    knowledgeItem: { findFirst: vi.fn() },
    exercise: { findMany: vi.fn() },
  }
  const generation = { getOrCreateReviewExercise: vi.fn() }
  const service = new ReviewQueueService(
    prisma as unknown as PrismaService,
    generation as unknown as ExerciseGenerationService,
  )

  beforeEach(() => {
    vi.clearAllMocks()
    prisma.courseRouteVersion.findUnique.mockResolvedValue({ id: 'route.1' })
    generation.getOrCreateReviewExercise.mockResolvedValue(null)
  })

  it('returns no exercise when nothing is due', async () => {
    prisma.userMemory.findMany.mockResolvedValue([])

    await expect(
      service.getNext('user.1', 'route.1', 'ru', []),
    ).resolves.toEqual({ dueCount: 0, exercise: null, flashcard: null })
    expect(prisma.exercise.findMany).not.toHaveBeenCalled()
  })

  it('selects an exercise that covers the earliest due item', async () => {
    prisma.userMemory.findMany.mockResolvedValue([
      { itemId: 'grammar.early' },
      { itemId: 'word.later' },
    ])
    prisma.exercise.findMany.mockResolvedValue([
      {
        id: 'exercise.later',
        lessonId: 'lesson.1',
        targetLanguage: 'fi',
        answerSpec: {
          acceptedVariants: ['Myöhempi vastaus.'],
          slots: [],
        },
        prompts: [{ text: 'Позднее задание' }],
        items: [{ itemId: 'word.later', role: ExerciseItemRole.SECONDARY }],
      },
      {
        id: 'exercise.early',
        lessonId: 'lesson.1',
        targetLanguage: 'fi',
        answerSpec: {
          acceptedVariants: ['Ensisijainen vastaus.'],
          slots: [],
        },
        prompts: [{ text: 'Приоритетное задание' }],
        items: [
          { itemId: 'grammar.early', role: ExerciseItemRole.PRIMARY },
          { itemId: 'word.later', role: ExerciseItemRole.SECONDARY },
        ],
      },
    ])

    await expect(
      service.getNext('user.1', 'route.1', 'ru', []),
    ).resolves.toEqual({
      dueCount: 2,
      exercise: {
        id: 'exercise.early',
        lessonId: 'lesson.1',
        sourceLanguage: 'ru',
        targetLanguage: 'fi',
        prompt: 'Приоритетное задание',
        answerSpec: {
          acceptedVariants: ['Ensisijainen vastaus.'],
          slots: [],
        },
        checkerVersion: 'structured-v5-split-lexical-grammar-evidence-voikko',
        reviewItemIds: ['grammar.early', 'word.later'],
      },
      flashcard: null,
    })
    expect(prisma.exercise.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: ContentStatus.CURATED,
          items: expect.objectContaining({ some: expect.any(Object) }),
        }),
      }),
    )
  })

  it('prefers a generated exercise over the prepared fallback', async () => {
    prisma.userMemory.findMany.mockResolvedValue([{ itemId: 'grammar.early' }])
    generation.getOrCreateReviewExercise.mockResolvedValue({
      id: 'generated.1',
      lessonId: 'lesson.1',
      sourceLanguage: 'ru',
      targetLanguage: 'fi',
      prompt: 'Сгенерированное задание',
      answerSpec: { acceptedVariants: ['Vastaus.'], slots: [] },
      checkerVersion: 'structured-v4-all-diagnostics-voikko',
      reviewItemIds: ['grammar.early'],
    })

    await expect(
      service.getNext('user.1', 'route.1', 'ru', []),
    ).resolves.toEqual({
      dueCount: 1,
      exercise: expect.objectContaining({ id: 'generated.1' }),
      flashcard: null,
    })
    expect(prisma.exercise.findMany).not.toHaveBeenCalled()
  })

  it('falls back to a lexical flashcard for a text-only word', async () => {
    prisma.userMemory.findMany.mockResolvedValue([
      { itemId: 'word.fi.reader.aamu' },
    ])
    prisma.exercise.findMany.mockResolvedValue([])
    prisma.knowledgeItem.findFirst.mockResolvedValue({
      lexicalSense: {
        gloss: { ru: 'утро' },
        metadata: {
          example: {
            target: 'Aamulla luen kirjaa.',
            source: { ru: 'Утром я читаю книгу.' },
          },
        },
        lexicalEntry: { lemma: 'aamu' },
      },
    })

    await expect(
      service.getNext('user.1', 'route.1', 'ru', []),
    ).resolves.toEqual({
      dueCount: 1,
      exercise: null,
      flashcard: {
        itemId: 'word.fi.reader.aamu',
        lemma: 'aamu',
        gloss: { ru: 'утро' },
        example: {
          target: 'Aamulla luen kirjaa.',
          source: { ru: 'Утром я читаю книгу.' },
        },
      },
    })
  })

  it('does not expose a draft or unknown route', async () => {
    prisma.courseRouteVersion.findUnique.mockResolvedValue(null)

    await expect(
      service.getNext('user.1', 'route.draft', 'ru', []),
    ).rejects.toBeInstanceOf(NotFoundException)
    expect(prisma.userMemory.findMany).not.toHaveBeenCalled()
  })
})
