import type { LessonProgressResponse } from '@language/contracts'
import { describe, expect, it } from 'vitest'

import {
  getCompletedLessonPartCount,
  getLatestAvailableLesson,
  getNextLessonPart,
  isLessonPartComplete,
} from './home-progress'

describe('home progress', () => {
  it('starts a new lesson with the explanation', () => {
    expect(getNextLessonPart(undefined)).toBe('explanation')
    expect(getCompletedLessonPartCount(undefined)).toBe(0)
  })

  it('continues with the first unfinished lesson part', () => {
    const progress = lessonProgress({
      explanationCompletedAt: '2026-08-23T10:00:00.000Z',
    })

    expect(getNextLessonPart(progress)).toBe('vocabulary')
    expect(getCompletedLessonPartCount(progress)).toBe(1)
    expect(isLessonPartComplete(progress, 'explanation')).toBe(true)
    expect(isLessonPartComplete(progress, 'practice')).toBe(false)
  })

  it('offers a completed lesson from the beginning when revisited', () => {
    const timestamp = '2026-08-23T10:00:00.000Z'
    const progress = lessonProgress({
      explanationCompletedAt: timestamp,
      vocabularyCompletedAt: timestamp,
      practiceCompletedAt: timestamp,
      completedAt: timestamp,
    })

    expect(getNextLessonPart(progress)).toBe('explanation')
    expect(getCompletedLessonPartCount(progress)).toBe(3)
  })

  it('selects the latest unlocked lesson instead of the last visited lesson', () => {
    const lessons = [
      { id: 'lesson.1', prerequisiteLessonIds: [] },
      { id: 'lesson.2', prerequisiteLessonIds: ['lesson.1'] },
      { id: 'lesson.3', prerequisiteLessonIds: ['lesson.2'] },
    ]

    expect(
      getLatestAvailableLesson(lessons, [
        lessonProgress({
          lessonId: 'lesson.1',
          completedAt: '2026-09-02T10:00:00.000Z',
        }),
      ]),
    ).toEqual(lessons[1])
  })

  it('keeps the first lesson as the next step for a new learner', () => {
    const lessons = [
      { id: 'lesson.1', prerequisiteLessonIds: [] },
      { id: 'lesson.2', prerequisiteLessonIds: ['lesson.1'] },
    ]

    expect(getLatestAvailableLesson(lessons, [])).toEqual(lessons[0])
  })
})

function lessonProgress(
  values: Partial<LessonProgressResponse>,
): LessonProgressResponse {
  return {
    lessonId: 'fi.olla.basics',
    explanationCompletedAt: null,
    vocabularyCompletedAt: null,
    practiceCompletedAt: null,
    practiceProgressPercent: 0,
    completedAt: null,
    ...values,
  }
}
