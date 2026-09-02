import type { PracticeSessionResponse } from '@language/contracts'
import { describe, expect, it } from 'vitest'

import {
  appendPracticeAttempt,
  getNextPracticeCorrection,
  practiceIsReadyToComplete,
} from './practice-session'

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
      pendingCorrections: [],
    })
  })

  it('delays a failed exercise and later clears it without advancing the main round', () => {
    const failed = appendPracticeAttempt(
      session(),
      'exercise.2',
      'attempt.2',
      false,
    )

    expect(failed).toMatchObject({
      answeredExercises: 2,
      correctAnswers: 1,
      pendingCorrections: [{ exerciseId: 'exercise.2', retryAfterAttempt: 14 }],
    })
    expect(getNextPracticeCorrection(failed)).toBeNull()

    const due = { ...failed, attemptIds: Array.from({ length: 14 }, String) }
    expect(getNextPracticeCorrection(due)).toBe('exercise.2')

    const corrected = appendPracticeAttempt(
      due,
      'exercise.2',
      'attempt.15',
      true,
    )
    expect(corrected.answeredExercises).toBe(2)
    expect(corrected.correctAnswers).toBe(2)
    expect(corrected.pendingCorrections).toEqual([])
  })

  it('finishes after the main round reaches the 85 percent threshold', () => {
    const complete = {
      ...session(),
      answeredExercises: 60,
      correctAnswers: 51,
      pendingCorrections: [{ exerciseId: 'exercise.7', retryAfterAttempt: 72 }],
    }

    expect(practiceIsReadyToComplete(complete)).toBe(true)
    expect(
      practiceIsReadyToComplete({
        ...complete,
        correctAnswers: 50,
      }),
    ).toBe(false)
  })
})

function session(): PracticeSessionResponse {
  return {
    startedAt: '2026-08-23T18:00:00.000Z',
    totalExercises: 60,
    requiredCorrectAnswers: 51,
    correctionDelay: 12,
    answeredExercises: 1,
    correctAnswers: 1,
    attemptIds: ['attempt.1'],
    completedExerciseIds: ['exercise.1'],
    pendingCorrections: [],
  }
}
