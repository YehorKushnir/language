import type { PrismaService } from '../database/prisma.service'
import { ForbiddenException } from '@nestjs/common'

export async function assertLessonAvailable(
  prisma: PrismaService,
  userId: string,
  routeVersionId: string,
  lessonId: string,
): Promise<void> {
  if (process.env.NODE_ENV === 'development') return

  const dependencies = await prisma.courseRouteDependency.findMany({
    where: { routeVersionId, lessonId },
    select: { prerequisiteLessonId: true },
  })
  if (dependencies.length === 0) return

  const prerequisiteIds = dependencies.map(
    (dependency) => dependency.prerequisiteLessonId,
  )
  const completedPrerequisites = await prisma.userLessonProgress.count({
    where: {
      userId,
      routeVersionId,
      lessonId: { in: prerequisiteIds },
      completedAt: { not: null },
    },
  })

  if (completedPrerequisites !== prerequisiteIds.length) {
    throw new ForbiddenException(
      'Сначала заверши предыдущий обязательный урок.',
    )
  }
}
