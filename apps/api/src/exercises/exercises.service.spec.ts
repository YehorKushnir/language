import {
  AttemptOutcome,
  EvidenceResult,
  ExerciseItemRole,
  KnowledgeItemKind,
  MemoryState,
} from '@language/database'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PrismaService } from '../database/prisma.service'
import { FinnishMorphologyService } from '../morphology/finnish-morphology.service'
import { ExercisesService } from './exercises.service'

describe('ExercisesService morphology diagnostics', () => {
  const transaction = {
    userAttempt: { create: vi.fn() },
    userMemory: { findUnique: vi.fn(), upsert: vi.fn() },
    userExerciseHistory: { upsert: vi.fn() },
  }
  const prisma = {
    courseRouteDependency: { findMany: vi.fn() },
    userLessonProgress: { count: vi.fn() },
    userAttempt: { findUnique: vi.fn(), findFirst: vi.fn() },
    exercise: { findFirst: vi.fn(), findMany: vi.fn() },
    userMemory: { findMany: vi.fn(), upsert: vi.fn() },
    exerciseReport: { upsert: vi.fn() },
    courseRouteEntry: { findFirst: vi.fn() },
    $transaction: vi.fn(
      async (operation: (client: typeof transaction) => Promise<unknown>) =>
        operation(transaction),
    ),
  }
  const morphology = { compareForms: vi.fn() }
  const service = new ExercisesService(
    prisma as unknown as PrismaService,
    morphology as unknown as FinnishMorphologyService,
  )

  beforeEach(() => {
    vi.clearAllMocks()
    prisma.courseRouteDependency.findMany.mockResolvedValue([])
    prisma.userAttempt.findUnique.mockResolvedValue(null)
    prisma.userMemory.findMany.mockResolvedValue([])
    prisma.userMemory.upsert.mockResolvedValue({})
    prisma.exercise.findFirst.mockResolvedValue({
      id: 'exercise.1',
      lessonId: 'lesson.1',
      answerSpec: {
        acceptedVariants: ['Minä olen opiskelija'],
        slots: [
          {
            role: 'subject',
            accepted: ['minä'],
            itemIds: ['grammar.fi.olla'],
            optional: true,
          },
          {
            role: 'verb',
            accepted: ['olen'],
            itemIds: ['grammar.fi.olla'],
          },
          {
            role: 'complement',
            accepted: ['opiskelija'],
            itemIds: ['word.fi.opiskelija'],
          },
        ],
      },
      items: [
        {
          itemId: 'grammar.fi.olla',
          role: ExerciseItemRole.PRIMARY,
          item: { kind: KnowledgeItemKind.GRAMMAR },
        },
        {
          itemId: 'word.fi.opiskelija',
          role: ExerciseItemRole.SECONDARY,
          item: { kind: KnowledgeItemKind.LEXICAL_SENSE },
        },
      ],
    })
    prisma.courseRouteEntry.findFirst.mockResolvedValue({
      lessonId: 'lesson.1',
    })
    transaction.userMemory.findUnique.mockResolvedValue(null)
    transaction.userMemory.upsert.mockResolvedValue({})
    transaction.userExerciseHistory.upsert.mockResolvedValue({})
    transaction.userAttempt.create.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) => {
        const evidence = (
          data.evidence as {
            create: Array<{
              itemId: string
              role: ExerciseItemRole
              result: EvidenceResult
            }>
          }
        ).create
        return {
          id: 'attempt.1',
          exerciseId: 'exercise.1',
          outcome: data.outcome as AttemptOutcome,
          normalizedAnswerText: data.normalizedAnswerText as string,
          diagnostics: data.diagnostics,
          evidence,
        }
      },
    )
  })

  it('turns a same-lemma mismatch into a precise grammar diagnostic', async () => {
    morphology.compareForms.mockResolvedValue({
      relation: 'sameLemma',
      actual: 'olet',
      expected: 'olen',
      actualAnalysis: {
        lemma: 'olla',
        partOfSpeech: 'verb',
        features: { person: 'second', number: 'singular' },
        raw: {},
      },
      expectedAnalysis: {
        lemma: 'olla',
        partOfSpeech: 'verb',
        features: { person: 'first', number: 'singular' },
        raw: {},
      },
      differences: [{ feature: 'person', actual: 'second', expected: 'first' }],
      suggestions: [],
    })

    const result = await service.submitAttempt('user.1', 'exercise.1', {
      answer: 'Minä olet opiskelija',
      idempotencyKey: '00000000-0000-4000-8000-000000000001',
      routeVersionId: 'route.1',
    })

    expect(morphology.compareForms).toHaveBeenCalledWith('olet', ['olen'])
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'WRONG_FORM',
        message: {
          ru: expect.stringContaining(
            'Лицо: сейчас второе лицо, нужно первое лицо.',
          ),
        },
        morphology: expect.objectContaining({
          relation: 'sameLemma',
          actualLemma: 'olla',
          expectedLemma: 'olla',
        }),
      }),
    ])
    expect(result.evidence).toEqual([
      {
        itemId: 'grammar.fi.olla',
        role: ExerciseItemRole.PRIMARY,
        result: EvidenceResult.FAILURE,
      },
      {
        itemId: 'word.fi.opiskelija',
        role: ExerciseItemRole.SECONDARY,
        result: EvidenceResult.SUCCESS,
      },
    ])
    expect(transaction.userAttempt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          checkerVersion: 'structured-v5-split-lexical-grammar-evidence-voikko',
        }),
      }),
    )
  })

  it('keeps the word successful when only its grammatical form is wrong', async () => {
    prisma.exercise.findFirst.mockResolvedValue({
      id: 'exercise.1',
      lessonId: 'lesson.1',
      answerSpec: {
        acceptedVariants: ['Puhun'],
        slots: [
          {
            role: 'verb',
            accepted: ['puhun'],
            itemIds: ['grammar.fi.present.common', 'word.fi.puhua'],
          },
        ],
      },
      items: [
        {
          itemId: 'grammar.fi.present.common',
          role: ExerciseItemRole.PRIMARY,
          item: { kind: KnowledgeItemKind.GRAMMAR },
        },
        {
          itemId: 'word.fi.puhua',
          role: ExerciseItemRole.SECONDARY,
          item: { kind: KnowledgeItemKind.LEXICAL_SENSE },
        },
      ],
    })
    morphology.compareForms.mockResolvedValue({
      relation: 'sameLemma',
      actual: 'puhut',
      expected: 'puhun',
      actualAnalysis: {
        lemma: 'puhua',
        partOfSpeech: 'verb',
        features: { person: 'second', number: 'singular' },
        raw: {},
      },
      expectedAnalysis: {
        lemma: 'puhua',
        partOfSpeech: 'verb',
        features: { person: 'first', number: 'singular' },
        raw: {},
      },
      differences: [{ feature: 'person', actual: 'second', expected: 'first' }],
      suggestions: [],
    })

    const result = await service.submitAttempt('user.1', 'exercise.1', {
      answer: 'Puhut',
      idempotencyKey: '00000000-0000-4000-8000-000000000005',
      routeVersionId: 'route.1',
    })

    expect(result.evidence).toEqual([
      {
        itemId: 'grammar.fi.present.common',
        role: ExerciseItemRole.PRIMARY,
        result: EvidenceResult.FAILURE,
      },
      {
        itemId: 'word.fi.puhua',
        role: ExerciseItemRole.SECONDARY,
        result: EvidenceResult.SUCCESS,
      },
    ])
    expect(transaction.userMemory.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_itemId: {
            userId: 'user.1',
            itemId: 'grammar.fi.present.common',
          },
        },
      }),
    )
  })

  it('credits grammar when a different word demonstrates the requested form', async () => {
    prisma.exercise.findFirst.mockResolvedValue({
      id: 'exercise.1',
      lessonId: 'lesson.1',
      answerSpec: {
        acceptedVariants: ['Puhun'],
        slots: [
          {
            role: 'verb',
            accepted: ['puhun'],
            itemIds: ['grammar.fi.present.common', 'word.fi.puhua'],
          },
        ],
      },
      items: [
        {
          itemId: 'grammar.fi.present.common',
          role: ExerciseItemRole.PRIMARY,
          item: { kind: KnowledgeItemKind.GRAMMAR },
        },
        {
          itemId: 'word.fi.puhua',
          role: ExerciseItemRole.SECONDARY,
          item: { kind: KnowledgeItemKind.LEXICAL_SENSE },
        },
      ],
    })
    morphology.compareForms.mockResolvedValue({
      relation: 'differentLemma',
      actual: 'sanon',
      expected: 'puhun',
      actualAnalysis: {
        lemma: 'sanoa',
        partOfSpeech: 'verb',
        features: {
          person: 'first',
          number: 'singular',
          tense: 'present',
        },
        raw: {},
      },
      expectedAnalysis: {
        lemma: 'puhua',
        partOfSpeech: 'verb',
        features: {
          person: 'first',
          number: 'singular',
          tense: 'present',
        },
        raw: {},
      },
      differences: [],
      suggestions: [],
    })

    const result = await service.submitAttempt('user.1', 'exercise.1', {
      answer: 'Sanon',
      idempotencyKey: '00000000-0000-4000-8000-000000000006',
      routeVersionId: 'route.1',
    })

    expect(result.evidence).toEqual([
      {
        itemId: 'grammar.fi.present.common',
        role: ExerciseItemRole.PRIMARY,
        result: EvidenceResult.SUCCESS,
      },
      {
        itemId: 'word.fi.puhua',
        role: ExerciseItemRole.SECONDARY,
        result: EvidenceResult.FAILURE,
      },
    ])
  })

  it('keeps the curated mixed exercise order ahead of attempt history', async () => {
    prisma.exercise.findMany.mockResolvedValue([
      {
        id: 'exercise.second',
        targetLanguage: 'fi',
        answerSpec: {
          selectionOrder: 2,
          acceptedVariants: ['Toinen vastaus.'],
          slots: [],
        },
        prompts: [{ text: 'Второе задание' }],
        userHistory: [],
        items: [
          {
            itemId: 'word.fi.second',
            item: { kind: KnowledgeItemKind.LEXICAL_SENSE },
          },
        ],
      },
      {
        id: 'exercise.first',
        targetLanguage: 'fi',
        answerSpec: {
          selectionOrder: 1,
          acceptedVariants: ['Ensimmäinen vastaus.'],
          slots: [],
        },
        prompts: [{ text: 'Первое задание' }],
        userHistory: [
          { timesSeen: 8, lastSeenAt: new Date('2026-08-24T00:00:00.000Z') },
        ],
        items: [
          {
            itemId: 'word.fi.first',
            item: { kind: KnowledgeItemKind.LEXICAL_SENSE },
          },
        ],
      },
    ])

    await expect(
      service.getNextExercise('user.1', 'route.1', 'lesson.1', 'ru', []),
    ).resolves.toMatchObject({
      id: 'exercise.first',
      prompt: 'Первое задание',
      answerSpec: {
        acceptedVariants: ['Ensimmäinen vastaus.'],
        slots: [],
      },
      checkerVersion: 'structured-v5-split-lexical-grammar-evidence-voikko',
    })
    expect(prisma.userMemory.upsert).toHaveBeenCalledWith({
      where: {
        userId_itemId: { userId: 'user.1', itemId: 'word.fi.first' },
      },
      update: {},
      create: expect.objectContaining({
        userId: 'user.1',
        itemId: 'word.fi.first',
        state: 'NEW',
        dueAt: expect.any(Date),
      }),
    })
  })

  it('prioritizes an exercise covering the earliest due word', async () => {
    prisma.exercise.findMany.mockResolvedValue([
      {
        id: 'exercise.ordered-first',
        targetLanguage: 'fi',
        answerSpec: { selectionOrder: 1, acceptedVariants: [], slots: [] },
        prompts: [{ text: 'Обычное задание' }],
        userHistory: [],
        items: [
          {
            itemId: 'word.fi.not-due',
            item: { kind: KnowledgeItemKind.LEXICAL_SENSE },
          },
        ],
      },
      {
        id: 'exercise.due',
        targetLanguage: 'fi',
        answerSpec: { selectionOrder: 20, acceptedVariants: [], slots: [] },
        prompts: [{ text: 'Просроченное слово' }],
        userHistory: [],
        items: [
          {
            itemId: 'word.fi.due',
            item: { kind: KnowledgeItemKind.LEXICAL_SENSE },
          },
        ],
      },
    ])
    prisma.userMemory.findMany.mockResolvedValue([{ itemId: 'word.fi.due' }])

    await expect(
      service.getNextExercise('user.1', 'route.1', 'lesson.1', 'ru', []),
    ).resolves.toMatchObject({
      id: 'exercise.due',
      prompt: 'Просроченное слово',
    })
    expect(prisma.userMemory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user.1',
          dueAt: { lte: expect.any(Date) },
        }),
      }),
    )
  })

  it('diagnoses olla when a valid optional subject is omitted', async () => {
    morphology.compareForms.mockResolvedValue({
      relation: 'sameLemma',
      actual: 'olet',
      expected: 'olen',
      actualAnalysis: {
        lemma: 'olla',
        partOfSpeech: 'verb',
        features: { person: 'second', number: 'singular' },
        raw: {},
      },
      expectedAnalysis: {
        lemma: 'olla',
        partOfSpeech: 'verb',
        features: { person: 'first', number: 'singular' },
        raw: {},
      },
      differences: [{ feature: 'person', actual: 'second', expected: 'first' }],
      suggestions: [],
    })

    const result = await service.submitAttempt('user.1', 'exercise.1', {
      answer: 'Olet opiskelija',
      idempotencyKey: '00000000-0000-4000-8000-000000000002',
      routeVersionId: 'route.1',
    })

    expect(morphology.compareForms).toHaveBeenCalledWith('olet', ['olen'])
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'WRONG_FORM',
        message: {
          ru: expect.stringContaining(
            'Лицо: сейчас второе лицо, нужно первое лицо.',
          ),
        },
      }),
    ])
    expect(result.diagnostics[0]?.message.ru).not.toContain('minä')
    expect(transaction.userAttempt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          evidence: {
            create: [
              expect.objectContaining({
                itemId: 'grammar.fi.olla',
                result: EvidenceResult.FAILURE,
              }),
              expect.objectContaining({
                itemId: 'word.fi.opiskelija',
                result: EvidenceResult.SUCCESS,
              }),
            ],
          },
        }),
      }),
    )
  })

  it('accepts the correct olla form without the optional subject', async () => {
    const result = await service.submitAttempt('user.1', 'exercise.1', {
      answer: 'Olen opiskelija',
      idempotencyKey: '00000000-0000-4000-8000-000000000003',
      routeVersionId: 'route.1',
    })

    expect(morphology.compareForms).not.toHaveBeenCalled()
    expect(result).toMatchObject({
      isCorrect: true,
      outcome: AttemptOutcome.CORRECT,
      diagnostics: [{ code: 'EXACT_MATCH' }],
      evidence: [
        {
          itemId: 'grammar.fi.olla',
          result: EvidenceResult.SUCCESS,
        },
        {
          itemId: 'word.fi.opiskelija',
          result: EvidenceResult.SUCCESS,
        },
      ],
    })
    expect(transaction.userMemory.upsert).toHaveBeenCalledWith({
      where: {
        userId_itemId: {
          userId: 'user.1',
          itemId: 'word.fi.opiskelija',
        },
      },
      update: {},
      create: expect.objectContaining({
        state: MemoryState.NEW,
        repetitions: 0,
        dueAt: expect.any(Date),
      }),
    })
  })

  it('treats an answer before dueAt as incidental exposure', async () => {
    transaction.userMemory.findUnique.mockResolvedValue({
      difficulty: 5,
      stability: 4,
      state: MemoryState.REVIEW,
      dueAt: new Date('2099-01-01T00:00:00.000Z'),
      lastReviewAt: new Date('2026-08-01T00:00:00.000Z'),
      elapsedDays: 0,
      scheduledDays: 4,
      learningSteps: 0,
      repetitions: 4,
      lapses: 0,
    })

    await service.submitAttempt('user.1', 'exercise.1', {
      answer: 'Olen opiskelija',
      idempotencyKey: '00000000-0000-4000-8000-000000000007',
      routeVersionId: 'route.1',
    })

    expect(transaction.userMemory.upsert).not.toHaveBeenCalled()
  })

  it('advances a due word once and ignores the next immediate answer', async () => {
    prisma.exercise.findFirst.mockResolvedValue({
      id: 'exercise.1',
      lessonId: 'lesson.1',
      answerSpec: {
        acceptedVariants: ['Opiskelija'],
        slots: [
          {
            role: 'word',
            accepted: ['opiskelija'],
            itemIds: ['word.fi.opiskelija'],
          },
        ],
      },
      items: [
        {
          itemId: 'word.fi.opiskelija',
          role: ExerciseItemRole.PRIMARY,
          item: { kind: KnowledgeItemKind.LEXICAL_SENSE },
        },
      ],
    })
    let storedMemory = {
      difficulty: 0,
      stability: 0,
      state: MemoryState.NEW,
      dueAt: new Date('2020-01-01T00:00:00.000Z'),
      lastReviewAt: null as Date | null,
      elapsedDays: 0,
      scheduledDays: 0,
      learningSteps: 0,
      repetitions: 0,
      lapses: 0,
    }
    transaction.userMemory.findUnique.mockImplementation(() =>
      Promise.resolve(storedMemory),
    )
    transaction.userMemory.upsert.mockImplementation(({ update }) => {
      storedMemory = { ...storedMemory, ...update }
      return Promise.resolve(storedMemory)
    })

    await service.submitAttempt('user.1', 'exercise.1', {
      answer: 'Opiskelija',
      idempotencyKey: '00000000-0000-4000-8000-000000000008',
      routeVersionId: 'route.1',
    })
    await service.submitAttempt('user.1', 'exercise.1', {
      answer: 'Opiskelija',
      idempotencyKey: '00000000-0000-4000-8000-000000000009',
      routeVersionId: 'route.1',
    })

    expect(storedMemory.repetitions).toBe(1)
    expect(transaction.userMemory.upsert).toHaveBeenCalledOnce()
  })

  it('keeps every structured diagnostic in the server response', async () => {
    morphology.compareForms.mockResolvedValue(undefined)
    const result = await service.submitAttempt('user.1', 'exercise.1', {
      answer: 'Minä olet opiskleija',
      idempotencyKey: '00000000-0000-4000-8000-000000000004',
      routeVersionId: 'route.1',
    })

    expect(result.diagnostics).toEqual([
      expect.objectContaining({ code: 'WRONG_FORM' }),
      expect.objectContaining({ code: 'TYPO' }),
    ])
    expect(
      result.diagnostics.map((diagnostic) => diagnostic.message.ru),
    ).toEqual([
      expect.stringContaining('olet'),
      expect.stringContaining('opiskleija'),
    ])
  })

  it('creates an idempotent quality report only for the user attempt', async () => {
    prisma.userAttempt.findFirst.mockResolvedValue({ id: 'attempt.1' })
    prisma.exerciseReport.upsert.mockResolvedValue({
      id: 'report.1',
      exerciseId: 'exercise.1',
      attemptId: 'attempt.1',
      reason: 'WRONG_ANSWER',
      comment: 'Вариант тоже корректный',
      status: 'NEW',
      createdAt: new Date('2026-08-23T00:00:00.000Z'),
      updatedAt: new Date('2026-08-23T00:00:00.000Z'),
    })

    await expect(
      service.reportExercise('user.1', 'exercise.1', {
        attemptId: 'attempt.1',
        reason: 'WRONG_ANSWER',
        comment: '  Вариант тоже корректный  ',
      }),
    ).resolves.toMatchObject({
      id: 'report.1',
      reason: 'WRONG_ANSWER',
      comment: 'Вариант тоже корректный',
    })
    expect(prisma.exerciseReport.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { attemptId: 'attempt.1' },
        update: expect.objectContaining({ status: 'NEW' }),
      }),
    )
  })
})
