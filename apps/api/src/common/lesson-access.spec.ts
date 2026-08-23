import { ForbiddenException } from '@nestjs/common'
import { describe, expect, it, vi } from 'vitest'

import { PrismaService } from '../database/prisma.service'
import { assertLessonAvailable } from './lesson-access'

describe('assertLessonAvailable', () => {
  it('allows the first lesson without dependencies', async () => {
    const prisma = createPrisma([], 0)
    await expect(
      assertLessonAvailable(prisma, 'user.1', 'route.1', 'lesson.1'),
    ).resolves.toBeUndefined()
    expect(prisma.userLessonProgress.count).not.toHaveBeenCalled()
  })

  it('rejects a lesson with an unfinished prerequisite', async () => {
    const prisma = createPrisma([{ prerequisiteLessonId: 'lesson.1' }], 0)
    await expect(
      assertLessonAvailable(prisma, 'user.1', 'route.1', 'lesson.2'),
    ).rejects.toBeInstanceOf(ForbiddenException)
  })

  it('allows a lesson after every prerequisite is complete', async () => {
    const prisma = createPrisma(
      [
        { prerequisiteLessonId: 'lesson.1' },
        { prerequisiteLessonId: 'lesson.extra' },
      ],
      2,
    )
    await expect(
      assertLessonAvailable(prisma, 'user.1', 'route.1', 'lesson.2'),
    ).resolves.toBeUndefined()
  })
})

function createPrisma(
  dependencies: Array<{ prerequisiteLessonId: string }>,
  completed: number,
) {
  return {
    courseRouteDependency: {
      findMany: vi.fn().mockResolvedValue(dependencies),
    },
    userLessonProgress: { count: vi.fn().mockResolvedValue(completed) },
  } as unknown as PrismaService & {
    courseRouteDependency: { findMany: ReturnType<typeof vi.fn> }
    userLessonProgress: { count: ReturnType<typeof vi.fn> }
  }
}
