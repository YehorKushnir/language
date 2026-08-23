import type { CourseOverviewResponse } from '@language/contracts'
import { ContentStatus } from '@language/database'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import {
  toLocalizedText,
  toNullableLocalizedText,
} from '../common/content-mapper'
import { PrismaService } from '../database/prisma.service'

@Injectable()
export class CourseCatalogService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getCourse(courseId: string): Promise<CourseOverviewResponse> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId, status: ContentStatus.CURATED },
      include: {
        routeVersions: {
          where: { status: ContentStatus.CURATED },
          orderBy: { version: 'desc' },
          take: 1,
          include: {
            entries: {
              where: { lesson: { status: ContentStatus.CURATED } },
              orderBy: [{ modulePosition: 'asc' }, { lessonPosition: 'asc' }],
              include: {
                lesson: {
                  include: {
                    _count: {
                      select: {
                        exercises: {
                          where: { status: ContentStatus.CURATED },
                        },
                        knowledgeItems: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!course) {
      throw new NotFoundException(`Course ${courseId} was not found`)
    }

    const activeRoute = course.routeVersions[0]

    return {
      id: course.id,
      sourceLanguage: course.sourceLanguage,
      targetLanguage: course.targetLanguage,
      title: toLocalizedText(course.title),
      description: toNullableLocalizedText(course.description),
      status: course.status,
      route: activeRoute
        ? {
            id: activeRoute.id,
            version: activeRoute.version,
            lessons: activeRoute.entries.map(({ lesson, ...entry }) => ({
              id: lesson.id,
              modulePosition: entry.modulePosition,
              lessonPosition: entry.lessonPosition,
              title: toLocalizedText(lesson.title),
              summary: toNullableLocalizedText(lesson.summary),
              status: lesson.status,
              knowledgeItemCount: lesson._count.knowledgeItems,
              exerciseCount: lesson._count.exercises,
            })),
          }
        : null,
    }
  }
}
