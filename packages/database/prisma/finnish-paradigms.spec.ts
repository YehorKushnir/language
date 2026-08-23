import { describe, expect, it } from 'vitest'
import { finnishLearnerDictionaryEntries } from '@language/language-fi'

import { finnishGeneratedParadigms } from '../../../content/courses/ru-fi/finnish-paradigms.generated.js'
import { moduleOneVocabulary } from '../../../content/courses/ru-fi/module-one.js'

const nominalKeyForms = [
  ['nominative', 'singular'],
  ['genitive', 'singular'],
  ['partitive', 'singular'],
  ['illative', 'singular'],
  ['nominative', 'plural'],
  ['partitive', 'plural'],
  ['elative', 'plural'],
] as const

describe('complete Finnish vocabulary paradigms', () => {
  it('provides a useful paradigm for every inflected module-one word', () => {
    for (const item of moduleOneVocabulary) {
      if (item.partOfSpeech === 'adverb') continue
      expect(item.forms.length, item.lemma).toBeGreaterThanOrEqual(7)
      expect(
        item.forms.some(
          (form) => form.features.inflectionType || form.features.verbType,
        ),
        item.lemma,
      ).toBe(true)
    }
  })

  it('provides all seven learner-facing key forms for every noun', () => {
    const nouns = moduleOneVocabulary.filter(
      (item) => item.partOfSpeech === 'noun',
    )

    for (const noun of nouns) {
      for (const [grammaticalCase, number] of nominalKeyForms) {
        expect(
          noun.forms.some(
            (form) =>
              form.features.case === grammaticalCase &&
              form.features.number === number,
          ),
          `${noun.lemma}: ${number} ${grammaticalCase}`,
        ).toBe(true)
      }
    }
  })

  it('expands ystävä into the expected singular and plural forms', () => {
    const friend = moduleOneVocabulary.find((item) => item.lemma === 'ystävä')
    expect(friend?.forms.length).toBeGreaterThanOrEqual(24)
    expect(friend?.forms.map((form) => form.surface)).toEqual(
      expect.arrayContaining([
        'ystävä',
        'ystävän',
        'ystävää',
        'ystävään',
        'ystävät',
        'ystäviä',
        'ystävistä',
      ]),
    )
  })

  it('provides the core verb moods, voices and participles', () => {
    const verbs = moduleOneVocabulary.filter(
      (item) => item.partOfSpeech === 'verb',
    )

    for (const verb of verbs) {
      expect(
        hasForm(verb.forms, { mood: 'indicative', tense: 'present' }),
        verb.lemma,
      ).toBe(true)
      expect(
        hasForm(verb.forms, { mood: 'indicative', tense: 'imperfect' }),
        verb.lemma,
      ).toBe(true)
      expect(hasForm(verb.forms, { mood: 'conditional' }), verb.lemma).toBe(
        true,
      )
      expect(hasForm(verb.forms, { mood: 'imperative' }), verb.lemma).toBe(true)
      expect(hasForm(verb.forms, { voice: 'passive' }), verb.lemma).toBe(true)
      expect(hasForm(verb.forms, { form: 'past_participle' }), verb.lemma).toBe(
        true,
      )
    }
  })

  it('keeps every generated form id unique', () => {
    const ids = moduleOneVocabulary.flatMap((item) =>
      item.forms.map((form) => form.id),
    )
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('also completes inflected words that can be added from prepared texts', () => {
    const invariablePartsOfSpeech = new Set([
      'adposition',
      'adverb',
      'conjunction',
      'negativeVerb',
    ])

    for (const entry of finnishLearnerDictionaryEntries) {
      if (invariablePartsOfSpeech.has(entry.partOfSpeech)) continue
      const paradigm = finnishGeneratedParadigms[entry.lemma]
      expect(paradigm?.partOfSpeech, entry.lemma).toBe(entry.partOfSpeech)
      expect(paradigm?.forms.length, entry.lemma).toBeGreaterThanOrEqual(7)
    }
  })
})

function hasForm(
  forms: Array<{ features: Record<string, string> }>,
  expected: Record<string, string>,
) {
  return forms.some((form) =>
    Object.entries(expected).every(
      ([key, value]) => form.features[key] === value,
    ),
  )
}
