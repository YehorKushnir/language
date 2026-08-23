import { ContentStatus, ExerciseItemRole } from '@language/database'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PrismaService } from '../database/prisma.service'
import { FinnishMorphologyService } from '../morphology/finnish-morphology.service'
import { ExerciseGenerationService } from './exercise-generation.service'

const templateDefinition = {
  schemaVersion: 1,
  frame: 'identity',
  lessonId: 'fi.olla.basics',
  sourceLanguage: 'ru',
  targetLanguage: 'fi',
  personKeys: ['1sg', '2sg'],
  grammarItems: {
    affirmative: 'grammar.affirmative',
    negative: 'grammar.negative',
    question: 'grammar.question',
  },
  complements: [
    {
      key: 'student',
      itemId: 'word.student',
      singular: 'opiskelija',
      plural: 'opiskelijoita',
      sourceSingular: 'студент',
      sourcePlural: 'студенты',
    },
  ],
}

describe('ExerciseGenerationService', () => {
  const prisma = {
    exercise: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    exerciseTemplate: { findFirst: vi.fn() },
    userMemory: { findMany: vi.fn() },
  }
  const morphology = { analyzeText: vi.fn() }
  const service = new ExerciseGenerationService(
    prisma as unknown as PrismaService,
    morphology as unknown as FinnishMorphologyService,
  )

  beforeEach(() => {
    vi.clearAllMocks()
    prisma.exercise.findMany.mockResolvedValue([])
    prisma.exercise.findFirst.mockResolvedValue(null)
    prisma.userMemory.findMany.mockResolvedValue([])
  })

  it('returns a globally cached generated exercise', async () => {
    prisma.exercise.findMany.mockResolvedValue([
      {
        id: 'generated.cached',
        lessonId: 'fi.olla.basics',
        targetLanguage: 'fi',
        prompts: [{ text: 'Я студент.' }],
        items: [
          {
            itemId: 'grammar.affirmative',
            role: ExerciseItemRole.PRIMARY,
          },
        ],
      },
    ])

    await expect(
      service.getOrCreateReviewExercise(
        'user.1',
        'route.1',
        'ru',
        ['grammar.affirmative'],
        [],
      ),
    ).resolves.toEqual({
      id: 'generated.cached',
      lessonId: 'fi.olla.basics',
      sourceLanguage: 'ru',
      targetLanguage: 'fi',
      prompt: 'Я студент.',
      reviewItemIds: ['grammar.affirmative'],
    })
    expect(prisma.exerciseTemplate.findFirst).not.toHaveBeenCalled()
    expect(morphology.analyzeText).not.toHaveBeenCalled()
  })

  it('realizes, validates and stores a deterministic exercise', async () => {
    prisma.exerciseTemplate.findFirst.mockResolvedValue({
      id: 'template.identity@1',
      courseId: 'course.ru-fi',
      definition: templateDefinition,
    })
    morphology.analyzeText.mockResolvedValue({
      text: 'Minä olen opiskelija.',
      tokens: [
        { type: 'word', surface: 'Minä', analyses: [{}] },
        { type: 'word', surface: 'olen', analyses: [{}] },
        { type: 'word', surface: 'opiskelija', analyses: [{}] },
      ],
    })
    prisma.exercise.create.mockImplementation(
      ({
        data,
      }: {
        data: {
          id: string
          lessonId: string
          targetLanguage: string
          prompts: { create: { text: string } }
        }
      }) => ({
        id: data.id,
        lessonId: data.lessonId,
        targetLanguage: data.targetLanguage,
        prompts: [{ text: data.prompts.create.text }],
        items: [
          {
            itemId: 'grammar.affirmative',
            role: ExerciseItemRole.PRIMARY,
          },
        ],
      }),
    )

    const result = await service.getOrCreateReviewExercise(
      'user.1',
      'route.1',
      'ru',
      ['grammar.affirmative'],
      [],
    )

    expect(result?.id).toMatch(/^generated\.[a-f0-9]{24}$/)
    expect(morphology.analyzeText).toHaveBeenCalledWith('Minä olen opiskelija.')
    expect(prisma.exercise.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: result?.id,
          status: ContentStatus.GENERATED,
          targetText: 'Minä olen opiskelija.',
          generated: {
            create: expect.objectContaining({
              generatorVersion: 'finnish-identity-v1',
              parametersHash: expect.stringMatching(/^[a-f0-9]{64}$/),
            }),
          },
        }),
      }),
    )
  })

  it('lets the review queue fall back when there is no curated template', async () => {
    prisma.exerciseTemplate.findFirst.mockResolvedValue(null)

    await expect(
      service.getOrCreateReviewExercise(
        'user.1',
        'route.1',
        'ru',
        ['grammar.affirmative'],
        [],
      ),
    ).resolves.toBeNull()
    expect(prisma.exercise.create).not.toHaveBeenCalled()
  })

  it('does not generate for an unsupported earliest due item', async () => {
    prisma.exerciseTemplate.findFirst.mockResolvedValue({
      id: 'template.identity@1',
      courseId: 'course.ru-fi',
      definition: templateDefinition,
    })

    await expect(
      service.getOrCreateReviewExercise(
        'user.1',
        'route.1',
        'ru',
        ['register.spoken', 'grammar.affirmative'],
        [],
      ),
    ).resolves.toBeNull()
    expect(morphology.analyzeText).not.toHaveBeenCalled()
    expect(prisma.exercise.create).not.toHaveBeenCalled()
  })
})
