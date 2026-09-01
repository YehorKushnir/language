import type { UserVocabularyResponse } from '@language/contracts'
import { describe, expect, it } from 'vitest'

import { applyOptimisticWordMemoryStatus } from './vocabulary-memory-status'

describe('optimistic vocabulary memory status', () => {
  it('immediately presents a manually known word as learned at 100%', () => {
    const changed = applyOptimisticWordMemoryStatus(
      vocabulary,
      'word.fi.asua',
      'KNOWN',
      new Date('2026-09-01T12:00:00.000Z'),
    )

    expect(changed.items[0]?.memory).toMatchObject({
      state: 'REVIEW',
      status: 'LEARNED',
      progressPercent: 100,
      dueAt: '2026-10-31T12:00:00.000Z',
      isDue: false,
    })
    expect(changed.counts).toMatchObject({
      due: 0,
      learning: 0,
      learned: 1,
    })
    expect(changed.dueCount).toBe(0)
  })

  it('restores the progress that preceded a manual known status', () => {
    const learned = applyOptimisticWordMemoryStatus(
      vocabulary,
      'word.fi.asua',
      'KNOWN',
    )
    const changed = applyOptimisticWordMemoryStatus(
      learned,
      'word.fi.asua',
      'LEARNING',
      new Date('2026-09-01T12:00:00.000Z'),
      vocabulary.items[0]?.memory,
    )

    expect(changed.items[0]?.memory).toMatchObject({
      state: 'RELEARNING',
      status: 'LEARNING',
      progressPercent: 12,
      dueAt: '2026-08-31T12:00:00.000Z',
      isDue: true,
      repetitions: 4,
      lapses: 1,
    })
    expect(changed.counts).toMatchObject({
      due: 1,
      learning: 1,
      learned: 0,
    })
    expect(changed.dueCount).toBe(1)
  })

  it('waits for the server instead of optimistically resetting without a snapshot', () => {
    const learned = applyOptimisticWordMemoryStatus(
      vocabulary,
      'word.fi.asua',
      'KNOWN',
    )

    expect(
      applyOptimisticWordMemoryStatus(learned, 'word.fi.asua', 'LEARNING'),
    ).toBe(learned)
  })
})

const vocabulary: UserVocabularyResponse = {
  routeVersionId: 'route.1',
  totalCount: 1,
  dueCount: 1,
  counts: { all: 1, due: 1, learning: 1, learned: 0 },
  items: [
    {
      itemId: 'word.fi.asua',
      lexicalEntryId: 'lex.fi.asua',
      lemma: 'asua',
      partOfSpeech: 'verb',
      gloss: { ru: 'жить' },
      example: null,
      forms: [],
      status: 'CURATED',
      introducedIn: {
        kind: 'lesson',
        lessonId: 'lesson.1',
        title: { ru: 'Первый урок' },
      },
      memory: {
        state: 'RELEARNING',
        status: 'LEARNING',
        progressPercent: 12,
        dueAt: '2026-08-31T12:00:00.000Z',
        isDue: true,
        repetitions: 4,
        lapses: 1,
      },
    },
  ],
  grammarCounts: { all: 0, due: 0, learning: 0, learned: 0 },
  grammarItems: [],
}
