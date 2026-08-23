import {
  AttemptOutcome,
  EvidenceResult,
  ExerciseItemRole,
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
    userAttempt: { findUnique: vi.fn(), findFirst: vi.fn() },
    exercise: { findFirst: vi.fn() },
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
    prisma.userAttempt.findUnique.mockResolvedValue(null)
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
        },
        {
          itemId: 'word.fi.opiskelija',
          role: ExerciseItemRole.SECONDARY,
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
          checkerVersion: 'structured-v3-optional-slots-voikko',
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
  })

  it('creates an idempotent quality report only for the user attempt', async () => {
    prisma.userAttempt.findFirst.mockResolvedValue({ id: 'attempt.1' })
    prisma.exerciseReport.upsert.mockResolvedValue({
      id: 'report.1',
      exerciseId: 'exercise.1',
      attemptId: 'attempt.1',
      reason: 'WRONG_ANSWER',
      comment: 'Вариант тоже корректный',
      status: 'OPEN',
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
        update: expect.objectContaining({ status: 'OPEN' }),
      }),
    )
  })
})
