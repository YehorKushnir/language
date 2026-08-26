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
    exerciseTemplate: { findMany: vi.fn() },
    userMemory: { findMany: vi.fn() },
  }
  const morphology = { analyzeText: vi.fn() }
  const service = new ExerciseGenerationService(
    prisma as unknown as PrismaService,
    morphology as unknown as FinnishMorphologyService,
  )

  beforeEach(() => {
    vi.resetAllMocks()
    prisma.exercise.findMany.mockResolvedValue([])
    prisma.exercise.findFirst.mockResolvedValue(null)
    prisma.exerciseTemplate.findMany.mockResolvedValue([])
    prisma.userMemory.findMany.mockResolvedValue([])
  })

  it('returns a globally cached generated exercise', async () => {
    prisma.exercise.findMany.mockResolvedValue([
      {
        id: 'generated.cached',
        lessonId: 'fi.olla.basics',
        targetLanguage: 'fi',
        answerSpec: {
          acceptedVariants: ['Minä olen opiskelija.'],
          slots: [],
        },
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
      answerSpec: {
        acceptedVariants: ['Minä olen opiskelija.'],
        slots: [],
      },
      checkerVersion: 'structured-v5-split-lexical-grammar-evidence-voikko',
      reviewItemIds: ['grammar.affirmative'],
    })
    expect(prisma.exerciseTemplate.findMany).not.toHaveBeenCalled()
    expect(morphology.analyzeText).not.toHaveBeenCalled()
  })

  it('realizes, validates and stores a deterministic exercise', async () => {
    prisma.exerciseTemplate.findMany.mockResolvedValue([
      {
        id: 'template.identity@1',
        courseId: 'course.ru-fi',
        definition: templateDefinition,
      },
    ])
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

  it('generates a reviewed variation for a later lesson item', async () => {
    const variationDefinition = {
      schemaVersion: 1,
      frame: 'prepared-variation',
      lessonId: 'fi.present.common',
      sourceLanguage: 'ru',
      targetLanguage: 'fi',
      exerciseIds: ['exercise.fi.present.common.word.1'],
      supportedItemIds: ['grammar.fi.present.common', 'word.fi.m1.02.01'],
    }
    prisma.exercise.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        id: 'exercise.fi.present.common.word.1',
        lessonId: 'fi.present.common',
        targetText: 'Minä puhun suomea.',
        answerSpec: {
          acceptedVariants: ['Minä puhun suomea.', 'Puhun suomea.'],
          slots: [
            {
              role: 'subject',
              accepted: ['minä'],
              itemIds: ['grammar.fi.present.common'],
              optional: true,
            },
            {
              role: 'verb',
              accepted: ['puhun'],
              itemIds: ['grammar.fi.present.common', 'word.fi.m1.02.01'],
            },
          ],
        },
        prompts: [{ text: 'Я говорю по-фински.' }],
        items: [
          {
            itemId: 'grammar.fi.present.common',
            role: ExerciseItemRole.PRIMARY,
          },
          {
            itemId: 'word.fi.m1.02.01',
            role: ExerciseItemRole.SECONDARY,
          },
        ],
      },
    ])
    prisma.exerciseTemplate.findMany.mockResolvedValue([
      {
        id: 'template.fi.present.common.prepared-variation@1',
        courseId: 'course.ru-fi',
        definition: variationDefinition,
      },
    ])
    morphology.analyzeText.mockResolvedValue({
      text: 'Puhun suomea.',
      tokens: [
        { type: 'word', surface: 'Puhun', analyses: [{}] },
        { type: 'word', surface: 'suomea', analyses: [{}] },
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
            itemId: 'word.fi.m1.02.01',
            role: ExerciseItemRole.PRIMARY,
          },
        ],
      }),
    )

    const result = await service.getOrCreateReviewExercise(
      'user.1',
      'route.1',
      'ru',
      ['word.fi.m1.02.01'],
      [],
    )

    expect(result).toMatchObject({
      lessonId: 'fi.present.common',
      prompt: 'Я говорю по-фински.',
      reviewItemIds: ['word.fi.m1.02.01'],
    })
    expect(morphology.analyzeText).toHaveBeenCalledWith('Puhun suomea.')
    expect(prisma.exercise.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          targetText: 'Puhun suomea.',
          answerSpec: expect.objectContaining({
            sourceExerciseId: 'exercise.fi.present.common.word.1',
            generatorVersion: 'finnish-prepared-variation-v1',
          }),
          generated: {
            create: expect.objectContaining({
              generatorVersion: 'finnish-prepared-variation-v1',
            }),
          },
        }),
      }),
    )
  })

  it('lets the review queue fall back when there is no curated template', async () => {
    prisma.exerciseTemplate.findMany.mockResolvedValue([])

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
    prisma.exerciseTemplate.findMany.mockResolvedValue([
      {
        id: 'template.identity@1',
        courseId: 'course.ru-fi',
        definition: templateDefinition,
      },
    ])

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
