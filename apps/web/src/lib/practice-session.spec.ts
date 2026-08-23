import type { PracticeSessionResponse } from '@language/contracts'
import { describe, expect, it } from 'vitest'

import { appendPracticeAttempt } from './practice-session'

describe('appendPracticeAttempt', () => {
  it('keeps the resumable practice counters in sync', () => {
    const updated = appendPracticeAttempt(
      session(),
      'exercise.2',
      'attempt.2',
      true,
    )

    expect(updated).toMatchObject({
      answeredExercises: 2,
      correctAnswers: 2,
      attemptIds: ['attempt.1', 'attempt.2'],
      completedExerciseIds: ['exercise.1', 'exercise.2'],
    })
  })

  it('does not count the same exercise twice', () => {
    const current = session()

    expect(
      appendPracticeAttempt(current, 'exercise.1', 'attempt.other', false),
    ).toBe(current)
  })
})

function session(): PracticeSessionResponse {
  return {
    startedAt: '2026-08-23T18:00:00.000Z',
    totalExercises: 60,
    requiredCorrectAnswers: 51,
    answeredExercises: 1,
    correctAnswers: 1,
    attemptIds: ['attempt.1'],
    completedExerciseIds: ['exercise.1'],
  }
}
