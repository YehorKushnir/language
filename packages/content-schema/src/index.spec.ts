import { describe, expect, it } from 'vitest'

import {
  ContentValidationError,
  validateLessonBundle,
  validatePreparedTexts,
} from './index.js'

const validBundle = {
  lessonId: 'fi.test.lesson',
  content: {
    version: 1,
    sections: ['explanation', 'vocabulary', 'practice'],
    explanationScreens: [
      {
        id: 'intro',
        title: { ru: 'Введение' },
        paragraphs: [{ ru: 'Объяснение.' }],
        examples: [{ target: 'Minä olen.', source: { ru: 'Я есть.' } }],
      },
    ],
  },
  vocabulary: [
    {
      key: 'learner',
      itemId: 'word.fi.learner',
      conceptId: 'concept.person.learner',
      lexicalEntryId: 'lex.fi.oppija',
      lemma: 'oppija',
      partOfSpeech: 'noun',
      gloss: 'ученик',
      example: {
        target: 'Hän on oppija.',
        source: { ru: 'Он или она — ученик.' },
      },
      semanticTypes: ['person'],
      singular: 'oppija',
      plural: 'oppijoita',
      sourceSingular: 'ученик',
      sourcePlural: 'ученики',
      forms: [
        {
          id: 'form.fi.oppija.nominative.sg',
          surface: 'oppija',
          features: { case: 'nominative' },
        },
      ],
    },
  ],
  exercises: [
    {
      id: 'exercise.fi.test.001',
      selectionOrder: 1,
      prompt: 'Я ученик.',
      targetText: 'Minä olen oppija.',
      acceptedVariants: ['Minä olen oppija.'],
      slots: [
        {
          role: 'subject',
          accepted: ['minä'],
          itemIds: ['grammar.fi.olla.affirmative'],
        },
        {
          role: 'verb',
          accepted: ['olen'],
          itemIds: ['grammar.fi.olla.affirmative'],
        },
        {
          role: 'complement',
          accepted: ['oppija'],
          itemIds: ['word.fi.learner'],
        },
      ],
      primaryItemId: 'grammar.fi.olla.affirmative',
      secondaryItemIds: [],
      vocabularyItemId: 'word.fi.learner',
    },
  ],
}

describe('validateLessonBundle', () => {
  it('returns a compact coverage report for valid content', () => {
    expect(
      validateLessonBundle(validBundle, {
        expectedExerciseCount: 1,
        minimumExampleCount: 1,
        minimumVocabularyCount: 1,
      }),
    ).toEqual({
      lessonId: 'fi.test.lesson',
      explanationScreenCount: 1,
      exampleCount: 1,
      vocabularyCount: 1,
      exerciseCount: 1,
    })
  })

  it('rejects broken references and non-contiguous exercise ordering', () => {
    const invalidBundle = structuredClone(validBundle)
    invalidBundle.exercises[0]!.selectionOrder = 2
    invalidBundle.exercises[0]!.vocabularyItemId = 'word.fi.missing'

    expect(() => validateLessonBundle(invalidBundle)).toThrowError(
      ContentValidationError,
    )
    expect(() => validateLessonBundle(invalidBundle)).toThrow(
      /references unknown vocabulary item/u,
    )
  })

  it('rejects service fields inside a lesson explanation', () => {
    const invalidBundle = structuredClone(validBundle)
    const screen = invalidBundle.content.explanationScreens[0]!
    ;(screen as unknown as Record<string, unknown>).quickChecks = []
    ;(screen.examples[0] as unknown as Record<string, unknown>).note = {
      ru: 'Лишнее пояснение.',
    }

    expect(() => validateLessonBundle(invalidBundle)).toThrowError(
      ContentValidationError,
    )
    expect(() => validateLessonBundle(invalidBundle)).toThrow(
      /Unrecognized key/u,
    )
  })
})

describe('validatePreparedTexts', () => {
  it('verifies token offsets and knowledge item references', () => {
    expect(
      validatePreparedTexts([
        {
          id: 'text.fi.test',
          courseId: 'course.ru-fi',
          title: { ru: 'Тест' },
          level: 'A1',
          topics: ['знакомство'],
          body: 'Minä olen.',
          knowledgeItemIds: ['grammar.fi.olla'],
          tokens: [
            {
              position: 0,
              surface: 'Minä',
              lemma: 'minä',
              analysis: { partOfSpeech: 'pronoun' },
              charStart: 0,
              charEnd: 4,
            },
            {
              position: 1,
              surface: 'olen',
              lemma: 'olla',
              analysis: { partOfSpeech: 'verb' },
              charStart: 5,
              charEnd: 9,
            },
          ],
        },
      ]),
    ).toEqual({ textCount: 1, tokenCount: 2, lexicalTokenCount: 0 })
  })

  it('rejects a token that does not match the body', () => {
    expect(() =>
      validatePreparedTexts([
        {
          id: 'text.fi.broken',
          courseId: 'course.ru-fi',
          title: { ru: 'Тест' },
          level: 'A1',
          topics: ['тест'],
          body: 'Minä.',
          knowledgeItemIds: ['grammar.fi.olla'],
          tokens: [
            {
              position: 0,
              surface: 'Sinä',
              lemma: 'sinä',
              analysis: { partOfSpeech: 'pronoun' },
              charStart: 0,
              charEnd: 4,
            },
          ],
        },
      ]),
    ).toThrow(/does not match the text body/u)
  })
})
