import { AttemptOutcome, MemoryState } from '@language/database'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PrismaService } from '../database/prisma.service'
import { CourseProgressService } from './course-progress.service'

describe('CourseProgressService vocabulary study', () => {
  const transaction = {
    userMemory: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    userCourseProgress: {
      upsert: vi.fn(),
    },
  }
  const prisma = {
    courseRouteDependency: { findMany: vi.fn() },
    userLessonProgress: { count: vi.fn() },
    courseRouteEntry: {
      findFirst: vi.fn(),
    },
    lessonKnowledgeItem: {
      findFirst: vi.fn(),
    },
    userAttempt: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(
      (callback: (client: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
    ),
  }
  const service = new CourseProgressService(prisma as unknown as PrismaService)

  beforeEach(() => {
    vi.clearAllMocks()
    prisma.courseRouteDependency.findMany.mockResolvedValue([])
    prisma.lessonKnowledgeItem.findFirst.mockResolvedValue({ itemId: 'word.1' })
    transaction.userMemory.findUnique.mockResolvedValue(null)
    transaction.userCourseProgress.upsert.mockResolvedValue({})
    transaction.userMemory.upsert.mockImplementation(({ create }) =>
      Promise.resolve(create),
    )
  })

  it('creates a review memory for a known flashcard', async () => {
    const before = Date.now()
    const result = await service.studyVocabularyItem(
      'user.1',
      'route.1',
      'lesson.1',
      'word.1',
      'SUCCESS',
    )

    expect(result).toMatchObject({
      itemId: 'word.1',
      state: MemoryState.REVIEW,
      repetitions: 1,
      lapses: 0,
    })
    expect(new Date(result.dueAt).getTime() - before).toBeGreaterThanOrEqual(
      86_399_000,
    )
    expect(transaction.userCourseProgress.upsert).toHaveBeenCalledOnce()
  })

  it('rejects an item outside the lesson vocabulary', async () => {
    prisma.lessonKnowledgeItem.findFirst.mockResolvedValue(null)

    await expect(
      service.studyVocabularyItem(
        'user.1',
        'route.1',
        'lesson.1',
        'word.other',
        'FAILURE',
      ),
    ).rejects.toBeInstanceOf(NotFoundException)
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })
})

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

  it('completes practice after 51 correct answers out of 60', async () => {
    const attempts = createPracticeAttempts(51)
    prisma.userAttempt.findMany.mockResolvedValue(attempts)
    const completePart = vi
      .spyOn(service, 'completePart')
      .mockResolvedValue(progress)

    const result = await service.completePractice(
      'user.1',
      'route.1',
      'lesson.1',
      attempts.map((attempt) => attempt.id),
    )

    expect(result).toMatchObject({
      totalExercises: 60,
      correctAnswers: 51,
      requiredCorrectAnswers: 51,
      scorePercent: 85,
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

  it('does not complete practice below the 85 percent threshold', async () => {
    const attempts = createPracticeAttempts(50)
    prisma.userAttempt.findMany.mockResolvedValue(attempts)
    const completePart = vi.spyOn(service, 'completePart')
    vi.spyOn(service, 'getProgress').mockResolvedValue(progress)

    const result = await service.completePractice(
      'user.1',
      'route.1',
      'lesson.1',
      attempts.map((attempt) => attempt.id),
    )

    expect(result.passed).toBe(false)
    expect(result.correctAnswers).toBe(50)
    expect(result.scorePercent).toBe(83.3)
    expect(completePart).not.toHaveBeenCalled()
    expect(prisma.userLessonProgress.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { practiceStartedAt: null } }),
    )
  })

  it('rejects an incomplete set of attempts', async () => {
    await expect(
      service.completePractice(
        'user.1',
        'route.1',
        'lesson.1',
        Array.from({ length: 59 }, (_, index) => `attempt.${index + 1}`),
      ),
    ).rejects.toBeInstanceOf(BadRequestException)
    expect(prisma.userAttempt.findMany).not.toHaveBeenCalled()
  })

  it('rejects historical attempts outside an active practice session', async () => {
    prisma.userLessonProgress.findUnique.mockResolvedValue({
      practiceStartedAt: null,
    })

    await expect(
      service.completePractice(
        'user.1',
        'route.1',
        'lesson.1',
        createPracticeAttempts(60).map((attempt) => attempt.id),
      ),
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
      service.completePractice(
        'user.1',
        'route.1',
        'lesson.1',
        attempts.map((attempt) => attempt.id),
      ),
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
      requiredCorrectAnswers: 51,
      answeredExercises: 36,
      correctAnswers: 30,
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
