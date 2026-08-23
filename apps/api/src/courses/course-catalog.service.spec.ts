import { ContentStatus } from '@language/database'
import { describe, expect, it, vi } from 'vitest'

import { PrismaService } from '../database/prisma.service'
import { CourseCatalogService } from './course-catalog.service'

describe('CourseCatalogService', () => {
  it('exposes route prerequisites with each lesson', async () => {
    const prisma = {
      course: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'course.1',
          sourceLanguage: 'ru',
          targetLanguage: 'fi',
          title: { ru: 'Курс' },
          description: null,
          status: ContentStatus.CURATED,
          routeVersions: [
            {
              id: 'route.1',
              version: 1,
              dependencies: [
                { lessonId: 'lesson.2', prerequisiteLessonId: 'lesson.1' },
              ],
              entries: [entry('lesson.1', 1), entry('lesson.2', 2)],
            },
          ],
        }),
      },
    }
    const service = new CourseCatalogService(prisma as unknown as PrismaService)

    const result = await service.getCourse('course.1')

    expect(result.route?.lessons).toEqual([
      expect.objectContaining({
        id: 'lesson.1',
        prerequisiteLessonIds: [],
      }),
      expect.objectContaining({
        id: 'lesson.2',
        prerequisiteLessonIds: ['lesson.1'],
      }),
    ])
  })
})

function entry(id: string, lessonPosition: number) {
  return {
    modulePosition: 1,
    lessonPosition,
    lesson: {
      id,
      title: { ru: id },
      summary: null,
      status: ContentStatus.CURATED,
      _count: { knowledgeItems: 1, exercises: 60 },
    },
  }
}
