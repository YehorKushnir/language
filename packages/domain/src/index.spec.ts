import { describe, expect, it } from 'vitest'

import {
  alignStructuredAnswerSlots,
  changeWordMemoryStatus,
  checkExactAnswer,
  checkStructuredAnswer,
  checkStructuredAnswerItems,
  createInitialMemory,
  getMemoryProgressPercent,
  isMemoryLearned,
  isReviewDue,
  normalizeExactAnswer,
  recordReview,
  scheduleReview,
  type UserMemory,
} from './index.js'

describe('memory progress', () => {
  const baseMemory = {
    difficulty: 5,
    stability: 1,
    state: 'REVIEW' as const,
    dueAt: new Date('2026-08-31T00:00:00.000Z'),
    lastReviewAt: new Date('2026-08-01T00:00:00.000Z'),
    elapsedDays: 0,
    scheduledDays: 0,
    learningSteps: 0,
    repetitions: 1,
    lapses: 0,
  }

  it.each([
    [0, 0],
    [1, 2],
    [30, 50],
    [60, 99],
    [120, 99],
  ])('maps a %d-day interval to %d%% before confirmation', (days, percent) => {
    expect(
      getMemoryProgressPercent({ ...baseMemory, scheduledDays: days }),
    ).toBe(percent)
  })

  it('returns 100% only after a successful review following 60 days', () => {
    expect(
      getMemoryProgressPercent({
        ...baseMemory,
        elapsedDays: 60,
        scheduledDays: 120,
      }),
    ).toBe(100)
  })
})

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

const optionalFirstPersonAnswerSpec = {
  acceptedVariants: ['Minä olen lääkäri.', 'Olen lääkäri.'],
  slots: [
    {
      role: 'subject',
      accepted: ['minä'],
      itemIds: ['grammar.fi.olla.affirmative'],
      optional: true,
    },
    {
      role: 'mainVerb',
      accepted: ['olen'],
      itemIds: ['grammar.fi.olla.affirmative'],
    },
    {
      role: 'complement',
      accepted: ['lääkäri'],
      itemIds: ['word.fi.lääkäri'],
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

  it('reports every error found in the aligned sentence', () => {
    expect(
      checkStructuredAnswer('Hän en olet opiskleija.', negativeAnswerSpec),
    ).toMatchObject({
      isCorrect: false,
      diagnostics: [
        {
          code: 'WRONG_FORM',
          slot: 'negativeVerb',
          actual: 'en',
          expected: ['ei'],
        },
        {
          code: 'WRONG_FORM',
          slot: 'mainVerb',
          actual: 'olet',
          expected: ['ole'],
        },
        {
          code: 'TYPO',
          slot: 'complement',
          actual: 'opiskleija',
          expected: ['opiskelija'],
        },
      ],
    })
  })

  it('reports all three errors in a fully mismatched sentence', () => {
    expect(
      checkStructuredAnswer('mina ei lääkäy', optionalFirstPersonAnswerSpec),
    ).toMatchObject({
      isCorrect: false,
      diagnostics: [
        {
          code: 'TYPO',
          slot: 'subject',
          actual: 'mina',
          expected: ['minä'],
        },
        {
          code: 'WRONG_FORM',
          slot: 'mainVerb',
          actual: 'ei',
          expected: ['olen'],
        },
        {
          code: 'WRONG_FORM',
          slot: 'complement',
          actual: 'lääkäy',
          expected: ['lääkäri'],
        },
      ],
    })
  })

  describe('optional Finnish subject', () => {
    it.each(['Minä olen lääkäri.', 'Olen lääkäri.'])(
      'accepts the valid answer %s',
      (answer) => {
        expect(
          checkStructuredAnswer(answer, optionalFirstPersonAnswerSpec),
        ).toMatchObject({
          isCorrect: true,
          diagnostics: [{ code: 'EXACT_MATCH' }],
        })
      },
    )

    it('reports the wrong olla form instead of a missing pronoun', () => {
      expect(
        checkStructuredAnswer('Olet lääkäri.', optionalFirstPersonAnswerSpec),
      ).toMatchObject({
        isCorrect: false,
        diagnostics: [
          {
            code: 'WRONG_FORM',
            slot: 'mainVerb',
            actual: 'olet',
            expected: ['olen'],
          },
        ],
      })
    })

    it('still detects a missing required verb when the subject is present', () => {
      expect(
        checkStructuredAnswer('Minä lääkäri.', optionalFirstPersonAnswerSpec),
      ).toMatchObject({
        isCorrect: false,
        diagnostics: [
          {
            code: 'MISSING_TOKEN',
            slot: 'mainVerb',
            expected: ['olen'],
          },
        ],
      })
    })

    it('detects word order and extra tokens in a subjectless answer', () => {
      expect(
        checkStructuredAnswer('Lääkäri olen.', optionalFirstPersonAnswerSpec),
      ).toMatchObject({ diagnostics: [{ code: 'WORD_ORDER' }] })
      expect(
        checkStructuredAnswer(
          'Olen hyvä lääkäri.',
          optionalFirstPersonAnswerSpec,
        ),
      ).toMatchObject({
        diagnostics: [{ code: 'EXTRA_TOKEN', actual: 'hyvä' }],
      })
    })

    it('does not make third-person subjects optional', () => {
      expect(
        checkStructuredAnswer('On lääkäri.', {
          acceptedVariants: ['Hän on lääkäri.'],
          slots: [
            { role: 'subject', accepted: ['hän'] },
            { role: 'mainVerb', accepted: ['on'] },
            { role: 'complement', accepted: ['lääkäri'] },
          ],
        }),
      ).toMatchObject({
        diagnostics: [
          {
            code: 'MISSING_TOKEN',
            slot: 'subject',
            expected: ['hän'],
          },
        ],
      })
    })

    it('handles omitted subjects in negative statements and questions', () => {
      expect(
        checkStructuredAnswer('Et ole lääkäri.', {
          acceptedVariants: ['En ole lääkäri.'],
          slots: [
            { role: 'subject', accepted: ['minä'], optional: true },
            { role: 'negativeVerb', accepted: ['en'] },
            { role: 'mainVerb', accepted: ['ole'] },
            { role: 'complement', accepted: ['lääkäri'] },
          ],
        }),
      ).toMatchObject({
        diagnostics: [
          {
            code: 'WRONG_FORM',
            slot: 'negativeVerb',
            actual: 'et',
            expected: ['en'],
          },
        ],
      })

      expect(
        checkStructuredAnswer('Oletko lääkäri?', {
          acceptedVariants: ['Olenko lääkäri?'],
          slots: [
            { role: 'questionVerb', accepted: ['olenko'] },
            { role: 'subject', accepted: ['minä'], optional: true },
            { role: 'complement', accepted: ['lääkäri'] },
          ],
        }),
      ).toMatchObject({
        diagnostics: [
          {
            code: 'TYPO',
            slot: 'questionVerb',
            actual: 'oletko',
            expected: ['olenko'],
          },
        ],
      })
    })
  })
})

describe('structured item evidence', () => {
  it('exposes the token aligned to a combined lexical and grammar slot', () => {
    expect(
      alignStructuredAnswerSlots('Puhut.', {
        acceptedVariants: ['Puhun.'],
        slots: [
          {
            role: 'verb',
            accepted: ['puhun'],
            itemIds: ['grammar.fi.present.common', 'word.fi.puhua'],
          },
        ],
      }),
    ).toEqual({
      isExact: false,
      hasWordOrderError: false,
      slots: [
        {
          role: 'verb',
          accepted: ['puhun'],
          itemIds: ['grammar.fi.present.common', 'word.fi.puhua'],
          result: 'SUBSTITUTE',
          actual: 'puhut',
        },
      ],
      extraTokens: [],
    })
  })

  it('keeps lexical slots matched while reporting word order separately', () => {
    expect(
      alignStructuredAnswerSlots('Opiskelija hän on.', {
        ...itemAwareNegativeAnswerSpec,
        acceptedVariants: ['Hän on opiskelija.'],
        slots: [
          {
            role: 'subject',
            accepted: ['hän'],
            itemIds: ['grammar.fi.olla.affirmative'],
          },
          {
            role: 'verb',
            accepted: ['on'],
            itemIds: ['grammar.fi.olla.affirmative'],
          },
          {
            role: 'complement',
            accepted: ['opiskelija'],
            itemIds: ['word.fi.opiskelija'],
          },
        ],
      }),
    ).toMatchObject({
      isExact: false,
      hasWordOrderError: true,
      slots: [
        { role: 'subject', result: 'MATCH' },
        { role: 'verb', result: 'MATCH' },
        { role: 'complement', result: 'MATCH' },
      ],
    })
  })

  it('ignores an omitted optional subject but scores the wrong verb form', () => {
    expect(
      checkStructuredAnswerItems(
        'Olet lääkäri.',
        optionalFirstPersonAnswerSpec,
      ),
    ).toEqual([
      { itemId: 'grammar.fi.olla.affirmative', isCorrect: false },
      { itemId: 'word.fi.lääkäri', isCorrect: true },
    ])
    expect(
      checkStructuredAnswerItems(
        'Olen lääkäri.',
        optionalFirstPersonAnswerSpec,
      ),
    ).toEqual([
      { itemId: 'grammar.fi.olla.affirmative', isCorrect: true },
      { itemId: 'word.fi.lääkäri', isCorrect: true },
    ])
  })

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

  it('initializes first contact without recording a fake review', () => {
    expect(createInitialMemory(reviewedAt)).toEqual({
      difficulty: 0,
      stability: 0,
      state: 'NEW',
      dueAt: new Date('2026-08-22T12:20:00.000Z'),
      lastReviewAt: null,
      elapsedDays: 0,
      scheduledDays: 0,
      learningSteps: 0,
      repetitions: 0,
      lapses: 0,
    })
  })

  it('advances a due correct review exactly once', () => {
    const initial = createInitialMemory(reviewedAt)
    const first = recordReview(initial, 'SUCCESS', initial.dueAt)

    expect(first.wasScheduledReview).toBe(true)
    expect(first.memory.repetitions).toBe(1)
    expect(first.memory.dueAt.getTime()).toBeGreaterThan(
      initial.dueAt.getTime(),
    )

    const incidental = recordReview(
      first.memory,
      'SUCCESS',
      new Date(initial.dueAt.getTime() + 2 * 60_000),
    )
    expect(incidental).toEqual({
      memory: first.memory,
      wasScheduledReview: false,
    })
  })

  it('does not advance after ten correct incidental exposures', () => {
    const initial = createInitialMemory(reviewedAt)
    let memory = initial

    for (let minute = 1; minute <= 10; minute += 1) {
      const exposure = recordReview(
        memory,
        'SUCCESS',
        new Date(reviewedAt.getTime() + minute * 60_000),
      )
      expect(exposure.wasScheduledReview).toBe(false)
      memory = exposure.memory
    }

    expect(memory).toEqual(initial)
    expect(memory.state).toBe('NEW')
    expect(memory.repetitions).toBe(0)
  })

  it('brings a failed scheduled review back quickly without erasing history', () => {
    const initial = createInitialMemory(reviewedAt)
    const learned = recordReview(initial, 'SUCCESS', initial.dueAt).memory
    const failed = recordReview(learned, 'FAILURE', learned.dueAt)

    expect(failed.wasScheduledReview).toBe(true)
    expect(failed.memory.state).toBe('RELEARNING')
    expect(failed.memory.lapses).toBe(1)
    expect(failed.memory.repetitions).toBe(2)
    expect(failed.memory.dueAt.getTime() - learned.dueAt.getTime()).toBe(
      10 * 60_000,
    )
  })

  it('keeps repeated due failures in active short-interval learning', () => {
    const initial = createInitialMemory(reviewedAt)
    let memory = recordReview(initial, 'SUCCESS', initial.dueAt).memory

    for (let failure = 0; failure < 3; failure += 1) {
      const failed = recordReview(memory, 'FAILURE', memory.dueAt)
      expect(failed.wasScheduledReview).toBe(true)
      expect(
        failed.memory.dueAt.getTime() - memory.dueAt.getTime(),
      ).toBeLessThanOrEqual(10 * 60_000)
      memory = failed.memory
    }

    expect(memory.state).not.toBe('REVIEW')
    expect(memory.repetitions).toBe(4)
  })

  it('always schedules another review for a mature card', () => {
    let memory = createInitialMemory(reviewedAt)

    for (let success = 0; success < 12; success += 1) {
      memory = recordReview(memory, 'SUCCESS', memory.dueAt).memory
    }

    expect(memory.state).toBe('REVIEW')
    expect(memory.repetitions).toBe(12)
    expect(Number.isFinite(memory.dueAt.getTime())).toBe(true)
    expect(memory.dueAt.getTime()).toBeGreaterThan(
      memory.lastReviewAt!.getTime(),
    )
    expect(memory.scheduledDays).toBeGreaterThan(0)
  })

  it('manually marks a new word known but keeps a future review', () => {
    const known = changeWordMemoryStatus(
      createInitialMemory(reviewedAt),
      'KNOWN',
      reviewedAt,
    )

    expect(known).toMatchObject({
      state: 'REVIEW',
      dueAt: new Date('2026-10-21T12:00:00.000Z'),
      scheduledDays: 60,
    })
    expect(known.dueAt).not.toBeNull()
    expect(isMemoryLearned(known)).toBe(false)
  })

  it('presents an item as learned only after a successful 60-day review', () => {
    const known = changeWordMemoryStatus(
      createInitialMemory(reviewedAt),
      'KNOWN',
      reviewedAt,
    )
    const confirmed = recordReview(known, 'SUCCESS', known.dueAt)

    expect(confirmed.wasScheduledReview).toBe(true)
    expect(confirmed.memory.elapsedDays).toBe(60)
    expect(isMemoryLearned(confirmed.memory)).toBe(true)
  })

  it('does not present an item as learned after a failed 60-day review', () => {
    const known = changeWordMemoryStatus(
      createInitialMemory(reviewedAt),
      'KNOWN',
      reviewedAt,
    )
    const failed = recordReview(known, 'FAILURE', known.dueAt)

    expect(failed.wasScheduledReview).toBe(true)
    expect(isMemoryLearned(failed.memory)).toBe(false)
  })

  it('manually marks a word learning with a short scheduled step', () => {
    const learning = changeWordMemoryStatus(
      createInitialMemory(reviewedAt),
      'LEARNING',
      reviewedAt,
    )

    expect(learning).toMatchObject({
      state: 'LEARNING',
      dueAt: new Date('2026-08-22T12:10:00.000Z'),
    })
  })
})
