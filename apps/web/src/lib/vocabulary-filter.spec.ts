import type { UserVocabularyItemResponse } from '@language/contracts'
import { describe, expect, it } from 'vitest'

import {
  matchesVocabularyFilter,
  matchesVocabularySearch,
} from './vocabulary-filter'

const item: UserVocabularyItemResponse = {
  itemId: 'word.fi.opiskelija',
  lexicalEntryId: 'lex.fi.opiskelija',
  lemma: 'opiskelija',
  partOfSpeech: 'noun',
  gloss: { ru: 'студент' },
  example: { target: 'Hän opiskelee.', source: { ru: 'Он учится.' } },
  forms: [
    {
      id: 'form.fi.opiskelijan',
      surface: 'opiskelijan',
      features: { case: 'genitive' },
      audioUrl: null,
    },
  ],
  status: 'CURATED',
  introducedIn: {
    kind: 'lesson',
    lessonId: 'lesson.1',
    title: { ru: 'Урок 1' },
  },
  memory: {
    state: 'RELEARNING',
    dueAt: '2026-08-23T00:00:00.000Z',
    isDue: true,
    repetitions: 2,
    lapses: 1,
  },
}

describe('vocabulary filters', () => {
  it('searches only the lemma and translation', () => {
    expect(matchesVocabularySearch(item, 'opisk')).toBe(true)
    expect(matchesVocabularySearch(item, 'студ')).toBe(true)
    expect(matchesVocabularySearch(item, 'opiskelijan')).toBe(false)
    expect(matchesVocabularySearch(item, 'учится')).toBe(false)
  })

  it('groups relearning words under learning and due independently', () => {
    expect(matchesVocabularyFilter(item, 'learning')).toBe(true)
    expect(matchesVocabularyFilter(item, 'due')).toBe(true)
    expect(matchesVocabularyFilter(item, 'review')).toBe(false)
  })
})
