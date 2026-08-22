import { MemoryState } from '@language/database'
import { NotFoundException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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
    lessonKnowledgeItem: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(
      (callback: (client: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
    ),
  }
  const service = new CourseProgressService(prisma as unknown as PrismaService)

  beforeEach(() => {
    vi.clearAllMocks()
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
