import { AttemptOutcome } from '@language/database'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PrismaService } from '../database/prisma.service'
import { CourseProgressService } from './course-progress.service'

describe('CourseProgressService vocabulary study', () => {
  const transaction = {
    userLessonVocabularyProgress: {
      upsert: vi.fn(),
      updateMany: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
    },
    userLessonVocabularyAttempt: { create: vi.fn() },
    userMemory: { upsert: vi.fn() },
    userCourseProgress: { upsert: vi.fn() },
  }
  const prisma = {
    courseRouteDependency: { findMany: vi.fn() },
    userLessonProgress: { count: vi.fn() },
    lessonKnowledgeItem: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    userLessonVocabularyProgress: {
      findMany: vi.fn(),
    },
    userLessonVocabularyAttempt: { findUnique: vi.fn() },
    userCourseProgress: { upsert: vi.fn() },
    userMemory: { upsert: vi.fn() },
    $transaction: vi.fn(
      (callback: (client: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
    ),
  }
  const service = new CourseProgressService(prisma as unknown as PrismaService)

  beforeEach(() => {
    vi.clearAllMocks()
    prisma.courseRouteDependency.findMany.mockResolvedValue([])
    prisma.lessonKnowledgeItem.findFirst.mockResolvedValue({
      itemId: 'word.1',
      item: {
        lexicalSense: { lexicalEntry: { lemma: 'opiskelija' } },
      },
    })
    prisma.lessonKnowledgeItem.findMany.mockResolvedValue([
      { itemId: 'word.1' },
      { itemId: 'word.2' },
    ])
    prisma.userLessonVocabularyProgress.findMany.mockResolvedValue([])
    prisma.userLessonVocabularyAttempt.findUnique.mockResolvedValue(null)
    prisma.userCourseProgress.upsert.mockResolvedValue({})
    prisma.userMemory.upsert.mockResolvedValue({})
    transaction.userLessonVocabularyProgress.upsert.mockResolvedValue({})
    transaction.userLessonVocabularyProgress.updateMany.mockResolvedValue({
      count: 1,
    })
    transaction.userLessonVocabularyProgress.findUniqueOrThrow.mockResolvedValue(
      vocabularyProgress(1),
    )
    transaction.userLessonVocabularyAttempt.create.mockResolvedValue({})
    transaction.userCourseProgress.upsert.mockResolvedValue({})
    transaction.userMemory.upsert.mockResolvedValue({})
  })

  it('restores persisted counters for every lesson word', async () => {
    prisma.userLessonVocabularyProgress.findMany.mockResolvedValue([
      vocabularyProgress(2),
    ])

    await expect(
      service.startOrResumeVocabulary('user.1', 'route.1', 'lesson.1'),
    ).resolves.toMatchObject({
      lessonId: 'lesson.1',
      requiredCorrectAnswers: 3,
      totalItems: 2,
      completedItems: 0,
      totalCorrectAnswers: 2,
      items: [
        { itemId: 'word.1', correctAnswers: 2 },
        { itemId: 'word.2', correctAnswers: 0 },
      ],
    })
    expect(prisma.userMemory.upsert).not.toHaveBeenCalled()
  })

  it('adds only the vocabulary card that was actually shown', async () => {
    await service.encounterVocabularyItem(
      'user.1',
      'route.1',
      'lesson.1',
      'word.1',
    )

    expect(prisma.lessonKnowledgeItem.findFirst).toHaveBeenCalledWith({
      where: {
        lessonId: 'lesson.1',
        itemId: 'word.1',
        item: { kind: 'LEXICAL_SENSE' },
        lesson: {
          status: 'CURATED',
          routeEntries: {
            some: {
              routeVersionId: 'route.1',
              routeVersion: { status: 'CURATED' },
            },
          },
        },
      },
      select: { itemId: true },
    })
    expect(prisma.userMemory.upsert).toHaveBeenCalledOnce()
    expect(prisma.userMemory.upsert).toHaveBeenCalledWith({
      where: { userId_itemId: { userId: 'user.1', itemId: 'word.1' } },
      update: {},
      create: expect.objectContaining({
        userId: 'user.1',
        itemId: 'word.1',
        state: 'NEW',
        repetitions: 0,
        dueAt: expect.any(Date),
      }),
    })
  })

  it('checks the typed answer on the server and stores one success', async () => {
    prisma.userLessonVocabularyProgress.findMany.mockResolvedValue([
      vocabularyProgress(1),
    ])

    const result = await service.submitVocabularyAnswer(
      'user.1',
      'route.1',
      'lesson.1',
      'word.1',
      'OPISKELIJA!',
      'c6b2f259-064e-4f8d-8596-7489761b61dd',
    )

    expect(result).toMatchObject({
      itemId: 'word.1',
      isCorrect: true,
      expectedAnswer: 'opiskelija',
      itemProgress: { correctAnswers: 1, attempts: 1 },
    })
    expect(
      transaction.userLessonVocabularyProgress.updateMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { correctAnswers: { increment: 1 } },
      }),
    )
    expect(transaction.userMemory.upsert).toHaveBeenCalledOnce()
    expect(transaction.userMemory.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: {} }),
    )
  })

  it('completes the lesson word after the third success without crediting a review', async () => {
    const completed = vocabularyProgress(3, new Date())
    transaction.userLessonVocabularyProgress.findUniqueOrThrow.mockResolvedValue(
      vocabularyProgress(3),
    )
    transaction.userLessonVocabularyProgress.update.mockResolvedValue(completed)
    prisma.lessonKnowledgeItem.findMany.mockResolvedValue([
      { itemId: 'word.1' },
    ])
    prisma.userLessonVocabularyProgress.findMany.mockResolvedValue([completed])
    const completePart = vi.spyOn(service, 'completePart').mockResolvedValue({
      routeVersionId: 'route.1',
      currentLessonId: 'lesson.1',
      completedLessons: 0,
      totalLessons: 1,
      dueReviews: 0,
      nextReviewAt: null,
      lessons: [],
    })

    const result = await service.submitVocabularyAnswer(
      'user.1',
      'route.1',
      'lesson.1',
      'word.1',
      'opiskelija',
      '09149d1a-4580-4e70-b7e1-38820b492c3f',
    )

    expect(result.itemProgress.correctAnswers).toBe(3)
    expect(result.session.completedItems).toBe(1)
    expect(transaction.userMemory.upsert).toHaveBeenCalledOnce()
    expect(transaction.userMemory.upsert).toHaveBeenCalledWith({
      where: {
        userId_itemId: { userId: 'user.1', itemId: 'word.1' },
      },
      update: {},
      create: expect.objectContaining({
        state: 'NEW',
        repetitions: 0,
      }),
    })
    expect(completePart).toHaveBeenCalledWith(
      'user.1',
      'route.1',
      'lesson.1',
      'vocabulary',
    )
  })

  it('adds an unknown word to learning without crediting a correct answer', async () => {
    transaction.userLessonVocabularyProgress.findUniqueOrThrow.mockResolvedValue(
      vocabularyProgress(0),
    )

    const result = await service.submitVocabularyAnswer(
      'user.1',
      'route.1',
      'lesson.1',
      'word.1',
      '',
      '20a6cc78-b299-490f-889f-48617837a8be',
      true,
    )

    expect(result).toMatchObject({
      itemId: 'word.1',
      isCorrect: false,
      expectedAnswer: 'opiskelija',
      itemProgress: { correctAnswers: 0, attempts: 1 },
    })
    expect(
      transaction.userLessonVocabularyProgress.updateMany,
    ).not.toHaveBeenCalled()
    expect(transaction.userMemory.upsert).toHaveBeenCalledWith({
      where: {
        userId_itemId: { userId: 'user.1', itemId: 'word.1' },
      },
      update: {},
      create: expect.objectContaining({
        userId: 'user.1',
        itemId: 'word.1',
        state: 'NEW',
      }),
    })
    expect(transaction.userLessonVocabularyAttempt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          answerText: '',
          isCorrect: false,
          correctAnswersAfter: 0,
        }),
      }),
    )
  })

  it('rejects an empty answer unless the learner gives up', async () => {
    await expect(
      service.submitVocabularyAnswer(
        'user.1',
        'route.1',
        'lesson.1',
        'word.1',
        ' ',
        'abed50d7-b1f1-458c-a948-e9d16b8e4fde',
      ),
    ).rejects.toThrow('Введите ответ или выберите «Не знаю».')
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('rejects an item outside the lesson vocabulary', async () => {
    prisma.lessonKnowledgeItem.findFirst.mockResolvedValue(null)

    await expect(
      service.submitVocabularyAnswer(
        'user.1',
        'route.1',
        'lesson.1',
        'word.other',
        'word',
        '70eb5adb-ac8f-4716-93a5-877c8f5f26fa',
      ),
    ).rejects.toBeInstanceOf(NotFoundException)
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })
})

function vocabularyProgress(
  correctAnswers: number,
  completedAt: Date | null = null,
) {
  return {
    userId: 'user.1',
    routeVersionId: 'route.1',
    lessonId: 'lesson.1',
    itemId: 'word.1',
    correctAnswers,
    attempts: Math.max(correctAnswers, 1),
    completedAt,
    lastAnsweredAt: new Date('2026-08-25T00:00:00.000Z'),
    updatedAt: new Date('2026-08-25T00:00:00.000Z'),
  }
}

describe('CourseProgressService lesson and course completion', () => {
  const transaction = {
    userLessonProgress: {
      upsert: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    userCourseProgress: { upsert: vi.fn() },
    courseRouteEntry: { findMany: vi.fn() },
  }
  const prisma = {
    courseRouteDependency: { findMany: vi.fn() },
    userLessonProgress: { count: vi.fn() },
    userLessonVocabularyProgress: { count: vi.fn() },
    lessonKnowledgeItem: { findMany: vi.fn() },
    courseRouteEntry: { findFirst: vi.fn() },
    $transaction: vi.fn(
      (operation: (client: typeof transaction) => Promise<unknown>) =>
        operation(transaction),
    ),
  }
  const service = new CourseProgressService(prisma as unknown as PrismaService)

  beforeEach(() => {
    vi.clearAllMocks()
    prisma.courseRouteDependency.findMany.mockResolvedValue([])
    prisma.courseRouteEntry.findFirst.mockResolvedValue({
      lessonId: 'lesson.1',
    })
    transaction.userLessonProgress.upsert.mockResolvedValue({
      explanationCompletedAt: new Date(),
      vocabularyCompletedAt: new Date(),
      practiceCompletedAt: new Date(),
      completedAt: null,
    })
    transaction.userLessonProgress.update.mockResolvedValue({})
    transaction.userLessonProgress.findMany.mockResolvedValue([])
    transaction.courseRouteEntry.findMany.mockResolvedValue([
      { lessonId: 'lesson.1' },
    ])
    transaction.userCourseProgress.upsert.mockResolvedValue({})
    vi.spyOn(service, 'getProgress').mockResolvedValue({
      routeVersionId: 'route.1',
      currentLessonId: 'lesson.1',
      completedLessons: 1,
      totalLessons: 1,
      dueReviews: 0,
      nextReviewAt: null,
      lessons: [],
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('marks the course complete when its last lesson is complete', async () => {
    await service.completePart('user.1', 'route.1', 'lesson.1', 'explanation')

    expect(transaction.userLessonProgress.update).toHaveBeenCalledOnce()
    expect(transaction.userCourseProgress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          currentLessonId: 'lesson.1',
          completedAt: expect.any(Date),
        }),
      }),
    )
  })

  it('does not let the vocabulary part bypass active recall', async () => {
    prisma.lessonKnowledgeItem.findMany.mockResolvedValue([
      { itemId: 'word.1' },
      { itemId: 'word.2' },
    ])
    prisma.userLessonVocabularyProgress.count.mockResolvedValue(1)

    await expect(
      service.completePart('user.1', 'route.1', 'lesson.1', 'vocabulary'),
    ).rejects.toBeInstanceOf(BadRequestException)
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })
})

describe('CourseProgressService practice completion', () => {
  const prisma = {
    courseRouteDependency: { findMany: vi.fn() },
    userLessonProgress: {
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    courseRouteEntry: {
      findFirst: vi.fn(),
    },
    userAttempt: {
      findMany: vi.fn(),
    },
  }
  const service = new CourseProgressService(prisma as unknown as PrismaService)
  const progress = {
    routeVersionId: 'route.1',
    currentLessonId: 'lesson.1',
    completedLessons: 0,
    totalLessons: 1,
    dueReviews: 0,
    nextReviewAt: null,
    lessons: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    prisma.courseRouteDependency.findMany.mockResolvedValue([])
    prisma.courseRouteEntry.findFirst.mockResolvedValue({
      lessonId: 'lesson.1',
    })
    prisma.userLessonProgress.findUnique.mockResolvedValue({
      practiceStartedAt: new Date('2026-08-23T18:00:00.000Z'),
    })
    prisma.userLessonProgress.update.mockResolvedValue({})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('completes practice after every initial error is corrected', async () => {
    const attempts = createPracticeAttempts(59)
    attempts.push({
      id: 'attempt.61',
      exerciseId: 'exercise.60',
      outcome: AttemptOutcome.CORRECT,
    })
    prisma.userAttempt.findMany.mockResolvedValue(attempts)
    const completePart = vi
      .spyOn(service, 'completePart')
      .mockResolvedValue(progress)

    const result = await service.completePractice(
      'user.1',
      'route.1',
      'lesson.1',
    )

    expect(result).toMatchObject({
      totalExercises: 60,
      correctAnswers: 60,
      requiredCorrectAnswers: 60,
      scorePercent: 100,
      passed: true,
      progress,
    })
    expect(completePart).toHaveBeenCalledWith(
      'user.1',
      'route.1',
      'lesson.1',
      'practice',
    )
    expect(prisma.userLessonProgress.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { practiceStartedAt: null } }),
    )
  })

  it('does not complete practice while an error remains unresolved', async () => {
    const attempts = createPracticeAttempts(50)
    prisma.userAttempt.findMany.mockResolvedValue(attempts)
    const completePart = vi.spyOn(service, 'completePart')

    await expect(
      service.completePractice('user.1', 'route.1', 'lesson.1'),
    ).rejects.toBeInstanceOf(BadRequestException)
    expect(completePart).not.toHaveBeenCalled()
    expect(prisma.userLessonProgress.update).not.toHaveBeenCalled()
  })

  it('rejects an incomplete set of attempts', async () => {
    prisma.userAttempt.findMany.mockResolvedValue(
      createPracticeAttempts(59).slice(0, 59),
    )

    await expect(
      service.completePractice('user.1', 'route.1', 'lesson.1'),
    ).rejects.toBeInstanceOf(BadRequestException)
    expect(prisma.userAttempt.findMany).toHaveBeenCalled()
  })

  it('rejects historical attempts outside an active practice session', async () => {
    prisma.userLessonProgress.findUnique.mockResolvedValue({
      practiceStartedAt: null,
    })

    await expect(
      service.completePractice('user.1', 'route.1', 'lesson.1'),
    ).rejects.toBeInstanceOf(BadRequestException)
    expect(prisma.userAttempt.findMany).not.toHaveBeenCalled()
  })

  it('rejects repeated exercises even when attempt ids are different', async () => {
    const attempts = createPracticeAttempts(60)
    attempts[59] = {
      id: attempts[59]!.id,
      exerciseId: attempts[0]!.exerciseId,
      outcome: attempts[59]!.outcome,
    }
    prisma.userAttempt.findMany.mockResolvedValue(attempts)

    await expect(
      service.completePractice('user.1', 'route.1', 'lesson.1'),
    ).rejects.toBeInstanceOf(BadRequestException)
  })
})

describe('CourseProgressService resumable practice', () => {
  const startedAt = new Date('2026-08-23T18:00:00.000Z')
  const transaction = {
    userLessonProgress: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    userAttempt: { findMany: vi.fn() },
  }
  const prisma = {
    courseRouteDependency: { findMany: vi.fn() },
    userLessonProgress: { count: vi.fn() },
    courseRouteEntry: { findFirst: vi.fn() },
    $transaction: vi.fn(
      (operation: (client: typeof transaction) => Promise<unknown>) =>
        operation(transaction),
    ),
  }
  const service = new CourseProgressService(prisma as unknown as PrismaService)

  beforeEach(() => {
    vi.clearAllMocks()
    prisma.courseRouteDependency.findMany.mockResolvedValue([])
    prisma.courseRouteEntry.findFirst.mockResolvedValue({
      lessonId: 'lesson.1',
    })
    transaction.userLessonProgress.findUnique.mockResolvedValue({
      practiceStartedAt: startedAt,
    })
    transaction.userAttempt.findMany.mockResolvedValue(
      createPracticeAttempts(30).slice(0, 36),
    )
  })

  it('returns the saved attempts and score after reopening practice', async () => {
    const result = await service.startOrResumePractice(
      'user.1',
      'route.1',
      'lesson.1',
    )

    expect(result).toMatchObject({
      startedAt: startedAt.toISOString(),
      totalExercises: 60,
      requiredCorrectAnswers: 60,
      correctionDelay: 12,
      answeredExercises: 36,
      correctAnswers: 30,
      pendingCorrections: expect.arrayContaining([
        { exerciseId: 'exercise.31', retryAfterAttempt: 43 },
      ]),
    })
    expect(result.attemptIds).toHaveLength(36)
    expect(result.completedExerciseIds).toHaveLength(36)
  })

  it('starts a new persisted session when none is active', async () => {
    transaction.userLessonProgress.findUnique.mockResolvedValue({
      practiceStartedAt: null,
    })
    transaction.userLessonProgress.upsert.mockImplementation(({ update }) =>
      Promise.resolve(update),
    )
    transaction.userAttempt.findMany.mockResolvedValue([])

    const result = await service.startOrResumePractice(
      'user.1',
      'route.1',
      'lesson.1',
    )

    expect(result.answeredExercises).toBe(0)
    expect(result.pendingCorrections).toEqual([])
    expect(transaction.userLessonProgress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { practiceStartedAt: expect.any(Date) },
      }),
    )
  })
})

function createPracticeAttempts(correctAnswers: number) {
  return Array.from({ length: 60 }, (_, index) => ({
    id: `attempt.${index + 1}`,
    exerciseId: `exercise.${index + 1}`,
    outcome:
      index < correctAnswers
        ? AttemptOutcome.CORRECT
        : AttemptOutcome.INCORRECT,
  }))
}
