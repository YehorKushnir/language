import { describe, expect, it } from 'vitest'

import {
  checkExactAnswer,
  checkStructuredAnswer,
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
})

describe('review scheduler', () => {
  const reviewedAt = new Date('2026-08-22T12:00:00.000Z')

  it('schedules a new successful item for the next day', () => {
    expect(scheduleReview(null, 'SUCCESS', reviewedAt)).toEqual({
      difficulty: 4.85,
      stability: 1,
      state: 'REVIEW',
      dueAt: new Date('2026-08-23T12:00:00.000Z'),
      lastReviewAt: reviewedAt,
      repetitions: 1,
      lapses: 0,
    })
  })

  it('grows the interval after another success', () => {
    expect(
      scheduleReview(
        { difficulty: 4.85, stability: 2, repetitions: 3, lapses: 0 },
        'SUCCESS',
        reviewedAt,
      ),
    ).toMatchObject({
      difficulty: 4.7,
      stability: 3.6,
      state: 'REVIEW',
      dueAt: new Date('2026-08-26T02:24:00.000Z'),
      repetitions: 4,
      lapses: 0,
    })
  })

  it('moves a failed item into a short relearning step', () => {
    expect(
      scheduleReview(
        { difficulty: 4.85, stability: 2, repetitions: 3, lapses: 1 },
        'FAILURE',
        reviewedAt,
      ),
    ).toEqual({
      difficulty: 5.35,
      stability: 1,
      state: 'RELEARNING',
      dueAt: new Date('2026-08-22T12:10:00.000Z'),
      lastReviewAt: reviewedAt,
      repetitions: 3,
      lapses: 2,
    })
  })
})
