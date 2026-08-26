import type {
  UserGrammarItemResponse,
  UserVocabularyItemResponse,
} from '@language/contracts'

import { localizedText } from './localized-text'

export type VocabularyFilter = 'all' | 'due' | 'new' | 'learning' | 'review'

export function matchesVocabularySearch(
  item: UserVocabularyItemResponse,
  search: string,
) {
  const normalizedSearch = search.trim().toLocaleLowerCase('ru')
  if (!normalizedSearch) return true

  return [item.lemma, localizedText(item.gloss)].some((value) =>
    value.toLocaleLowerCase('ru').includes(normalizedSearch),
  )
}

export function matchesGrammarSearch(
  item: UserGrammarItemResponse,
  search: string,
) {
  const normalizedSearch = search.trim().toLocaleLowerCase('ru')
  if (!normalizedSearch) return true

  return [
    localizedText(item.name),
    item.description ? localizedText(item.description) : '',
    localizedText(item.introducedIn.title),
  ].some((value) => value.toLocaleLowerCase('ru').includes(normalizedSearch))
}

export function matchesVocabularyFilter(
  item: UserVocabularyItemResponse | UserGrammarItemResponse,
  filter: VocabularyFilter,
) {
  if (filter === 'all') return true
  if (filter === 'due') return item.memory.isDue
  if (filter === 'new') return item.memory.state === 'NEW'
  if (filter === 'review') return item.memory.state === 'REVIEW'
  return item.memory.state === 'LEARNING' || item.memory.state === 'RELEARNING'
}
