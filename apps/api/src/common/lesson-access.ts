import type { PrismaService } from '../database/prisma.service'
import { ForbiddenException } from '@nestjs/common'

export async function assertLessonAvailable(
  prisma: PrismaService,
  userId: string,
  routeVersionId: string,
  lessonId: string,
): Promise<void> {
  const dependencies = await prisma.courseRouteDependency.findMany({
    where: { routeVersionId, lessonId },
    select: { prerequisiteLessonId: true },
  })
  if (dependencies.length === 0) return

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  if (user?.role === 'ADMIN') return

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
