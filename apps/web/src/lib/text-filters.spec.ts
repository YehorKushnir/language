import type { PreparedTextSummaryResponse } from '@language/contracts'
import { describe, expect, it } from 'vitest'

import { filterPreparedTexts, getTextFilterOptions } from './text-filters'

const texts: PreparedTextSummaryResponse[] = [
  text('a', 'A1', ['учёба'], 'grammar.a', 20),
  text('b', 'A2', ['город'], 'grammar.b', 55),
  text('c', 'A2', ['учёба'], 'grammar.a', 90),
]

describe('text catalog filters', () => {
  it('combines level, topic and grammar filters', () => {
    expect(
      filterPreparedTexts(texts, {
        level: 'A2',
        topic: 'учёба',
        grammarItemId: 'grammar.a',
        familiarity: 'all',
      }).map((item) => item.id),
    ).toEqual(['c'])
  })

  it('groups texts by vocabulary familiarity', () => {
    expect(
      filterPreparedTexts(texts, {
        level: 'all',
        topic: 'all',
        grammarItemId: 'all',
        familiarity: 'learning',
      }).map((item) => item.id),
    ).toEqual(['b'])
  })

  it('builds unique filter options', () => {
    expect(getTextFilterOptions(texts)).toMatchObject({
      levels: ['A1', 'A2'],
      topics: ['город', 'учёба'],
      grammarItems: [{ itemId: 'grammar.a' }, { itemId: 'grammar.b' }],
    })
  })
})

function text(
  id: string,
  level: string,
  topics: string[],
  grammarItemId: string,
  knownPercent: number,
): PreparedTextSummaryResponse {
  return {
    id,
    title: { ru: id },
    level,
    topics,
    grammarItems: [{ itemId: grammarItemId, label: { ru: grammarItemId } }],
    preview: id,
    wordCount: 10,
    linkedWordCount: 10,
    knownWordCount: knownPercent / 10,
    knownPercent,
    audioUrl: null,
  }
}
