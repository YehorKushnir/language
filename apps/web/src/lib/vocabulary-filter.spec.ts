import type {
  UserGrammarItemResponse,
  UserVocabularyItemResponse,
} from '@language/contracts'
import { describe, expect, it } from 'vitest'

import {
  matchesGrammarSearch,
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
    status: 'LEARNING',
    progressPercent: 12,
    dueAt: '2026-08-23T00:00:00.000Z',
    isDue: true,
    repetitions: 2,
    lapses: 1,
  },
}

const grammarItem: UserGrammarItemResponse = {
  itemId: 'grammar.fi.present.common',
  kind: 'GRAMMAR',
  name: { ru: 'Настоящее время частых глаголов' },
  description: { ru: 'Личные формы и согласование с подлежащим.' },
  introducedIn: {
    kind: 'lesson',
    lessonId: 'lesson.2',
    title: { ru: 'Глаголы первого типа' },
  },
  memory: {
    state: 'RELEARNING',
    status: 'LEARNING',
    progressPercent: 5,
    dueAt: '2026-08-23T00:00:00.000Z',
    isDue: true,
    repetitions: 1,
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

  it('groups every unconfirmed word under learning', () => {
    expect(matchesVocabularyFilter(item, 'learning')).toBe(true)
    expect(matchesVocabularyFilter(item, 'learned')).toBe(false)
  })

  it('searches grammar by its name, description, and lesson', () => {
    expect(matchesGrammarSearch(grammarItem, 'настоящее')).toBe(true)
    expect(matchesGrammarSearch(grammarItem, 'согласование')).toBe(true)
    expect(matchesGrammarSearch(grammarItem, 'первого типа')).toBe(true)
    expect(matchesGrammarSearch(grammarItem, 'партитив')).toBe(false)
    expect(matchesVocabularyFilter(grammarItem, 'learning')).toBe(true)
  })
})
