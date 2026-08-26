import type { LessonVocabularyStudySessionResponse } from '@language/contracts'
import { describe, expect, it } from 'vitest'

import {
  appendVocabularyAnswer,
  getNextVocabularyItemId,
} from './vocabulary-study-session'

describe('vocabulary study queue', () => {
  it('applies an answer locally before the server confirms it', () => {
    const result = appendVocabularyAnswer(
      session([2, 1]),
      'word.1',
      true,
      '2026-08-25T12:00:00.000Z',
    )

    expect(result.itemProgress).toEqual({
      itemId: 'word.1',
      correctAnswers: 3,
      attempts: 3,
      completedAt: '2026-08-25T12:00:00.000Z',
    })
    expect(result.session).toMatchObject({
      completedItems: 1,
      totalCorrectAnswers: 4,
    })
  })

  it('rotates to a word with fewer correct answers', () => {
    expect(
      getNextVocabularyItemId(
        ['word.1', 'word.2', 'word.3'],
        session([1, 0, 0]),
        'word.1',
      ),
    ).toBe('word.2')
  })

  it('returns a failed word after the rest of the current round', () => {
    expect(
      getNextVocabularyItemId(
        ['word.1', 'word.2', 'word.3'],
        session([0, 1, 1]),
        'word.3',
      ),
    ).toBe('word.1')
  })

  it('stops after every word reaches three answers', () => {
    expect(
      getNextVocabularyItemId(
        ['word.1', 'word.2', 'word.3'],
        session([3, 3, 3]),
        'word.3',
      ),
    ).toBeNull()
  })
})

function session(
  correctAnswers: number[],
): LessonVocabularyStudySessionResponse {
  return {
    lessonId: 'lesson.1',
    requiredCorrectAnswers: 3,
    totalItems: correctAnswers.length,
    completedItems: correctAnswers.filter((count) => count === 3).length,
    totalCorrectAnswers: correctAnswers.reduce((total, count) => total + count),
    items: correctAnswers.map((count, index) => ({
      itemId: `word.${index + 1}`,
      correctAnswers: count,
      attempts: count,
      completedAt: count === 3 ? '2026-08-25T00:00:00.000Z' : null,
    })),
  }
}
