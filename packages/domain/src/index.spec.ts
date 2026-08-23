import { describe, expect, it } from 'vitest'

import {
  checkExactAnswer,
  checkStructuredAnswer,
  checkStructuredAnswerItems,
  isReviewDue,
  normalizeExactAnswer,
  scheduleReview,
  type UserMemory,
} from './index.js'

const memory: UserMemory = {
  userId: 'user.local',
  itemId: 'grammar.fi.olla.negative',
  difficulty: 5,
  stability: 1,
  dueAt: new Date('2026-08-22T09:00:00.000Z'),
  lastReviewAt: null,
}

describe('isReviewDue', () => {
  it('returns true at the exact due time', () => {
    expect(isReviewDue(memory, new Date('2026-08-22T09:00:00.000Z'))).toBe(true)
  })

  it('returns false before the due time', () => {
    expect(isReviewDue(memory, new Date('2026-08-22T08:59:59.999Z'))).toBe(
      false,
    )
  })
})

describe('exact answer checker', () => {
  it('normalizes whitespace, casing, unicode, and final punctuation', () => {
    expect(normalizeExactAnswer('  HA\u0308N   EI ole opiskelija!  ')).toBe(
      'hän ei ole opiskelija',
    )
  })

  it('accepts any normalized curated variant', () => {
    expect(
      checkExactAnswer('Hän ei ole opiskelija', {
        acceptedVariants: [
          'Hän ei ole opiskelija.',
          'Ei, hän ei ole opiskelija.',
        ],
      }),
    ).toEqual({
      isCorrect: true,
      normalizedAnswer: 'hän ei ole opiskelija',
      matchedVariant: 'Hän ei ole opiskelija.',
    })
  })

  it('does not hide a meaningful word-order error', () => {
    expect(
      checkExactAnswer('Ei hän ole opiskelija.', {
        acceptedVariants: ['Hän ei ole opiskelija.'],
      }),
    ).toEqual({
      isCorrect: false,
      normalizedAnswer: 'ei hän ole opiskelija',
      matchedVariant: null,
    })
  })

  it('rejects an empty answer when no empty variant exists', () => {
    expect(
      checkExactAnswer('   ', {
        acceptedVariants: ['Hän ei ole opiskelija.'],
      }).isCorrect,
    ).toBe(false)
  })
})

const negativeAnswerSpec = {
  acceptedVariants: ['Hän ei ole opiskelija.'],
  slots: [
    { role: 'subject', accepted: ['hän'] },
    { role: 'negativeVerb', accepted: ['ei'] },
    { role: 'mainVerb', accepted: ['ole'] },
    { role: 'complement', accepted: ['opiskelija'] },
  ],
}

const itemAwareNegativeAnswerSpec = {
  acceptedVariants: ['Hän ei ole opiskelija.'],
  slots: [
    {
      role: 'subject',
      accepted: ['hän'],
      itemIds: ['grammar.fi.olla.negative'],
    },
    {
      role: 'negativeVerb',
      accepted: ['ei'],
      itemIds: ['grammar.fi.olla.negative'],
    },
    {
      role: 'mainVerb',
      accepted: ['ole'],
      itemIds: ['grammar.fi.olla.negative'],
    },
    {
      role: 'complement',
      accepted: ['opiskelija'],
      itemIds: ['word.fi.opiskelija'],
    },
  ],
}

describe('structured answer checker', () => {
  it('accepts a positional slot match even without a curated exact variant', () => {
    expect(
      checkStructuredAnswer('HÄN ei ole opiskelija!', {
        ...negativeAnswerSpec,
        acceptedVariants: [],
      }),
    ).toMatchObject({
      isCorrect: true,
      diagnostics: [{ code: 'EXACT_MATCH' }],
    })
  })

  it('diagnoses a missing token', () => {
    expect(
      checkStructuredAnswer('Hän ole opiskelija.', negativeAnswerSpec),
    ).toMatchObject({
      isCorrect: false,
      diagnostics: [
        {
          code: 'MISSING_TOKEN',
          slot: 'negativeVerb',
          expected: ['ei'],
        },
      ],
    })
  })

  it('diagnoses an extra token', () => {
    expect(
      checkStructuredAnswer('Hän ei ole hyvä opiskelija.', negativeAnswerSpec),
    ).toMatchObject({
      isCorrect: false,
      diagnostics: [{ code: 'EXTRA_TOKEN', actual: 'hyvä' }],
    })
  })

  it('diagnoses incorrect word order', () => {
    expect(
      checkStructuredAnswer('Ei hän ole opiskelija.', negativeAnswerSpec),
    ).toMatchObject({
      isCorrect: false,
      diagnostics: [{ code: 'WORD_ORDER' }],
    })
  })

  it('diagnoses a wrong form in a slot', () => {
    expect(
      checkStructuredAnswer('Hän en ole opiskelija.', negativeAnswerSpec),
    ).toMatchObject({
      isCorrect: false,
      diagnostics: [
        {
          code: 'WRONG_FORM',
          slot: 'negativeVerb',
          actual: 'en',
          expected: ['ei'],
        },
      ],
    })
  })

  it('distinguishes a likely typo from a grammar error', () => {
    expect(
      checkStructuredAnswer('Hän ei ole opiskleija.', negativeAnswerSpec),
    ).toMatchObject({
      isCorrect: false,
      diagnostics: [
        {
          code: 'TYPO',
          slot: 'complement',
          actual: 'opiskleija',
          expected: ['opiskelija'],
        },
      ],
    })
  })
})

describe('structured item evidence', () => {
  it('keeps vocabulary successful when the grammar form is wrong', () => {
    expect(
      checkStructuredAnswerItems(
        'Hän en ole opiskelija.',
        itemAwareNegativeAnswerSpec,
      ),
    ).toEqual([
      { itemId: 'grammar.fi.olla.negative', isCorrect: false },
      { itemId: 'word.fi.opiskelija', isCorrect: true },
    ])
  })

  it('keeps grammar successful when the vocabulary item is wrong', () => {
    expect(
      checkStructuredAnswerItems(
        'Hän ei ole opettaja.',
        itemAwareNegativeAnswerSpec,
      ),
    ).toEqual([
      { itemId: 'grammar.fi.olla.negative', isCorrect: true },
      { itemId: 'word.fi.opiskelija', isCorrect: false },
    ])
  })
})

describe('review scheduler', () => {
  const reviewedAt = new Date('2026-08-22T12:00:00.000Z')

  it('graduates a new successful item with an FSRS interval', () => {
    expect(scheduleReview(null, 'SUCCESS', reviewedAt)).toMatchObject({
      state: 'REVIEW',
      dueAt: new Date('2026-08-24T12:00:00.000Z'),
      lastReviewAt: reviewedAt,
      elapsedDays: 0,
      scheduledDays: 2,
      learningSteps: 0,
      repetitions: 1,
      lapses: 0,
    })
  })

  it('grows the interval after another success', () => {
    const firstReview = scheduleReview(null, 'SUCCESS', reviewedAt)
    const secondReview = scheduleReview(
      firstReview,
      'SUCCESS',
      firstReview.dueAt,
    )

    expect(secondReview.state).toBe('REVIEW')
    expect(secondReview.stability).toBeGreaterThan(firstReview.stability)
    expect(secondReview.dueAt.getTime()).toBeGreaterThan(
      firstReview.dueAt.getTime(),
    )
    expect(secondReview.repetitions).toBe(2)
  })

  it('moves a failed new item into a short learning step', () => {
    expect(scheduleReview(null, 'FAILURE', reviewedAt)).toMatchObject({
      state: 'LEARNING',
      dueAt: new Date('2026-08-22T12:10:00.000Z'),
      lastReviewAt: reviewedAt,
      scheduledDays: 0,
      repetitions: 1,
      lapses: 0,
    })
  })

  it('counts a failed review as a lapse and starts relearning', () => {
    const firstReview = scheduleReview(null, 'SUCCESS', reviewedAt)
    const failedReview = scheduleReview(
      firstReview,
      'FAILURE',
      firstReview.dueAt,
    )

    expect(failedReview).toMatchObject({
      state: 'RELEARNING',
      dueAt: new Date('2026-08-24T12:10:00.000Z'),
      repetitions: 2,
      lapses: 1,
    })
  })
})
