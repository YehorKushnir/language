import type { PreparedTextSummaryResponse } from '@language/contracts'

export type TextFamiliarityFilter = 'all' | 'known' | 'learning' | 'new'

export interface TextCatalogFilters {
  level: string
  topic: string
  grammarItemId: string
  familiarity: TextFamiliarityFilter
}

export function filterPreparedTexts(
  items: PreparedTextSummaryResponse[],
  filters: TextCatalogFilters,
) {
  return items.filter(
    (item) =>
      matchesValue(filters.level, item.level) &&
      matchesCollection(filters.topic, item.topics) &&
      matchesCollection(
        filters.grammarItemId,
        item.grammarItems.map((grammar) => grammar.itemId),
      ) &&
      matchesFamiliarity(filters.familiarity, item.knownPercent),
  )
}

export function getTextFilterOptions(items: PreparedTextSummaryResponse[]) {
  return {
    levels: unique(items.map((item) => item.level)),
    topics: unique(items.flatMap((item) => item.topics)),
    grammarItems: [
      ...new Map(
        items
          .flatMap((item) => item.grammarItems)
          .map((item) => [item.itemId, item]),
      ).values(),
    ],
  }
}

function matchesValue(filter: string, value: string) {
  return filter === 'all' || filter === value
}

function matchesCollection(filter: string, values: string[]) {
  return filter === 'all' || values.includes(filter)
}

function matchesFamiliarity(
  filter: TextFamiliarityFilter,
  knownPercent: number,
) {
  if (filter === 'all') return true
  if (filter === 'known') return knownPercent >= 80
  if (filter === 'learning') return knownPercent >= 30 && knownPercent < 80
  return knownPercent < 30
}

function unique(values: string[]) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right))
}
