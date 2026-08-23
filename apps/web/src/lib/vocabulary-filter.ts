import type { UserVocabularyItemResponse } from '@language/contracts'

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

export function matchesVocabularyFilter(
  item: UserVocabularyItemResponse,
  filter: VocabularyFilter,
) {
  if (filter === 'all') return true
  if (filter === 'due') return item.memory.isDue
  if (filter === 'new') return item.memory.state === 'NEW'
  if (filter === 'review') return item.memory.state === 'REVIEW'
  return item.memory.state === 'LEARNING' || item.memory.state === 'RELEARNING'
}
