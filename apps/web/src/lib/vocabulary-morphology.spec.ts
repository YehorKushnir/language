import type {
  LessonVocabularyFormResponse,
  UserVocabularyItemResponse,
} from '@language/contracts'
import { describe, expect, it } from 'vitest'

import {
  getVocabularyFormDimensions,
  getVocabularyFormsForDisplay,
  getVocabularyMorphology,
  matchesVocabularyFormSelections,
} from './vocabulary-morphology'

describe('vocabulary morphology', () => {
  it('presents the curated learning forms and reverse gradation for tavata', () => {
    const item = vocabularyItem({
      lemma: 'tavata',
      partOfSpeech: 'verb',
      forms: [
        form('infinitive', 'tavata', { form: 'infinitive', verbType: '4' }),
        form('present-1sg', 'tapaan', present('first', 'singular')),
        form('present-3sg', 'tapaa', present('third', 'singular')),
        form('present-2sg', 'tapaat', present('second', 'singular')),
        form('present-1pl', 'tapaamme', present('first', 'plural')),
        form('present-2pl', 'tapaatte', present('second', 'plural')),
        form('present-3pl', 'tapaavat', present('third', 'plural')),
        form('connegative', 'tapaa', {
          form: 'connegative',
          mood: 'indicative',
          tense: 'present',
        }),
        form('imperfect', 'tapasin', {
          mood: 'indicative',
          tense: 'imperfect',
          person: 'first',
          number: 'singular',
        }),
        form('participle', 'tavannut', {
          form: 'past_participle',
          voice: 'active',
        }),
        form('passive', 'tavataan', {
          mood: 'indicative',
          tense: 'present',
          voice: 'passive',
        }),
        form('conditional', 'tapaisin', {
          mood: 'conditional',
          person: 'first',
          number: 'singular',
        }),
        form('imperative', 'tapaa', {
          mood: 'imperative',
          person: 'second',
          number: 'singular',
        }),
      ],
    })

    const morphology = getVocabularyMorphology(item)

    expect(morphology.partOfSpeechLabel).toBe('Глагол')
    expect(morphology.typeLabel).toBe('тип 4')
    expect(morphology.stems).toEqual(['tapaa'])
    expect(morphology.gradation).toEqual({ from: 'v', to: 'p' })
    expect(morphology.change).toEqual({
      surface: 'tapaan',
      stem: 'tapaa',
      ending: 'n',
    })
    expect(morphology.keyForms.map(({ form }) => form.surface)).toEqual([
      'tapaan',
      'tapaa',
      'tapasin',
      'tavannut',
      'tavataan',
      'tapaisin',
      'tapaa',
    ])
  })

  it('presents the main singular and plural forms for kauppa', () => {
    const item = vocabularyItem({
      lemma: 'kauppa',
      partOfSpeech: 'noun',
      forms: [
        form('nominative-sg', 'kauppa', {
          case: 'nominative',
          number: 'singular',
          inflectionType: '9',
          gradationType: 'B',
        }),
        form('genitive-sg', 'kaupan', {
          case: 'genitive',
          number: 'singular',
        }),
        form('partitive-sg', 'kauppaa', {
          case: 'partitive',
          number: 'singular',
        }),
        form('illative-sg', 'kauppaan', {
          case: 'illative',
          number: 'singular',
        }),
        form('nominative-pl', 'kaupat', {
          case: 'nominative',
          number: 'plural',
        }),
        form('partitive-pl', 'kauppoja', {
          case: 'partitive',
          number: 'plural',
        }),
        form('elative-pl', 'kaupoista', {
          case: 'elative',
          number: 'plural',
        }),
      ],
    })

    const morphology = getVocabularyMorphology(item)

    expect(morphology.partOfSpeechLabel).toBe('Существительное')
    expect(morphology.typeLabel).toBe('тип склонения 9')
    expect(morphology.stems).toEqual(['kaupa', 'kauppa'])
    expect(morphology.gradation).toEqual({ from: 'pp', to: 'p' })
    expect(morphology.keyForms.map(({ form }) => form.surface)).toEqual([
      'kauppa',
      'kaupan',
      'kauppaa',
      'kauppaan',
      'kaupat',
      'kauppoja',
      'kaupoista',
    ])

    const dimensions = getVocabularyFormDimensions(item.forms)
    expect(dimensions.map(({ key }) => key)).toEqual(['number', 'case'])
    expect(
      item.forms.filter((candidate) =>
        matchesVocabularyFormSelections(candidate, {
          number: 'plural',
          case: 'elative',
        }),
      ),
    ).toEqual([expect.objectContaining({ surface: 'kaupoista' })])
  })

  it('does not invent consonant gradation for ystävä', () => {
    const item = vocabularyItem({
      lemma: 'ystävä',
      partOfSpeech: 'noun',
      forms: [
        form('nominative-sg', 'ystävä', {
          case: 'nominative',
          number: 'singular',
          inflectionType: '10',
        }),
        form('genitive-sg', 'ystävän', {
          case: 'genitive',
          number: 'singular',
        }),
      ],
    })

    expect(getVocabularyMorphology(item).gradation).toBeNull()
  })

  it('does not present a consonant-ending lemma as an inflectional stem', () => {
    const item = vocabularyItem({
      lemma: 'kuukausi',
      partOfSpeech: 'noun',
      forms: [
        form('nominative-sg', 'kuukausi', {
          case: 'nominative',
          number: 'singular',
          inflectionType: '27',
        }),
        form('genitive-sg', 'kuukauden', {
          case: 'genitive',
          number: 'singular',
        }),
      ],
    })

    expect(getVocabularyMorphology(item).stems).toEqual(['kuukaude'])
  })

  it('recognizes ordinary strong-to-weak consonant gradation', () => {
    const item = vocabularyItem({
      lemma: 'ottaa',
      partOfSpeech: 'verb',
      forms: [
        form('infinitive', 'ottaa', { form: 'infinitive', verbType: '1' }),
        form('present-1sg', 'otan', present('first', 'singular')),
      ],
    })

    expect(getVocabularyMorphology(item).gradation).toEqual({
      from: 'tt',
      to: 't',
    })
  })

  it('hides a technical lemma form when a learner-facing form duplicates it', () => {
    const forms = [
      form('lemma', 'kauppa', { form: 'lemma' }),
      form('nominative', 'kauppa', {
        case: 'nominative',
        number: 'singular',
      }),
    ]

    expect(getVocabularyFormsForDisplay(forms)).toEqual([forms[1]])
  })
})

function form(
  id: string,
  surface: string,
  features: Record<string, string>,
): LessonVocabularyFormResponse {
  return { id, surface, features, audioUrl: null }
}

function present(person: string, number: string) {
  return { mood: 'indicative', tense: 'present', person, number }
}

function vocabularyItem(input: {
  lemma: string
  partOfSpeech: string
  forms: LessonVocabularyFormResponse[]
}): UserVocabularyItemResponse {
  return {
    itemId: `word.fi.${input.lemma}`,
    lexicalEntryId: `lex.fi.${input.lemma}`,
    lemma: input.lemma,
    partOfSpeech: input.partOfSpeech,
    gloss: { ru: 'перевод' },
    example: null,
    forms: input.forms,
    status: 'CURATED',
    introducedIn: {
      kind: 'lesson',
      lessonId: 'lesson.1',
      title: { ru: 'Урок 1' },
    },
    memory: {
      state: 'LEARNING',
      dueAt: null,
      isDue: false,
      repetitions: 0,
      lapses: 0,
    },
  }
}
