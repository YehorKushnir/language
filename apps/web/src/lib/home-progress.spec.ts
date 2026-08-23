import type { LessonProgressResponse } from '@language/contracts'
import { describe, expect, it } from 'vitest'

import {
  getCompletedLessonPartCount,
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
})

function lessonProgress(
  values: Partial<LessonProgressResponse>,
): LessonProgressResponse {
  return {
    lessonId: 'fi.olla.basics',
    explanationCompletedAt: null,
    vocabularyCompletedAt: null,
    practiceCompletedAt: null,
    completedAt: null,
    ...values,
  }
}
