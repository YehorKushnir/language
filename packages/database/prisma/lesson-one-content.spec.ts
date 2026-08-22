import { describe, expect, it } from 'vitest'

import {
  lessonContent,
  lessonExercises,
  lessonVocabulary,
  validateLessonOneContent,
} from './lesson-one-content.js'

describe('lesson one content', () => {
  it('meets the curated MVP content checks', () => {
    expect(validateLessonOneContent()).toEqual([])
    expect(lessonExercises).toHaveLength(60)
    expect(lessonVocabulary).toHaveLength(11)
    expect(lessonContent.explanationScreens).toHaveLength(6)
  })

  it('keeps stable ordering for the original five exercises', () => {
    expect(
      lessonExercises.slice(0, 5).map(({ id, selectionOrder }) => ({
        id,
        selectionOrder,
      })),
    ).toEqual([
      { id: 'exercise.fi.olla.negative.001', selectionOrder: 1 },
      { id: 'exercise.fi.olla.affirmative.001', selectionOrder: 2 },
      { id: 'exercise.fi.olla.question.001', selectionOrder: 3 },
      { id: 'exercise.fi.olla.negative.002', selectionOrder: 4 },
      { id: 'exercise.fi.olla.question.002', selectionOrder: 5 },
    ])
  })
})
