import { describe, expect, it } from 'vitest'
import { getFinnishTextFormTranslation } from '@language/language-fi'

import {
  lessonContent,
  lessonExercises,
  lessonVocabulary,
  validateLessonOneContent,
} from '../../../content/courses/ru-fi/lessons/fi.olla.basics.js'
import {
  moduleOneLessons,
  moduleOneVocabulary,
} from '../../../content/courses/ru-fi/module-one.js'
import { preparedTexts } from '../../../content/courses/ru-fi/texts/fi.olla.introductions.js'
import {
  validateCourseContent,
  validateFinnishMorphologyContent,
} from './content-validation.js'

describe('lesson one content', () => {
  it('meets the curated MVP content checks', () => {
    expect(validateLessonOneContent()).toEqual([])
    expect(lessonExercises).toHaveLength(60)
    expect(lessonVocabulary).toHaveLength(17)
    expect(
      lessonVocabulary
        .filter((item) => item.partOfSpeech === 'pronoun')
        .map((item) => item.lemma),
    ).toEqual(['minä', 'sinä', 'hän', 'me', 'te', 'he'])
    expect(lessonContent.explanationScreens).toHaveLength(5)
  })

  it('keeps a stable mixed ordering for the opening exercises', () => {
    expect(
      lessonExercises.slice(0, 5).map(({ id, selectionOrder }) => ({
        id,
        selectionOrder,
      })),
    ).toEqual([
      { id: 'exercise.fi.olla.affirmative.001', selectionOrder: 1 },
      { id: 'exercise.fi.olla.affirmative.2sg.finnish', selectionOrder: 2 },
      { id: 'exercise.fi.olla.negative.001', selectionOrder: 3 },
      { id: 'exercise.fi.olla.question.001', selectionOrder: 4 },
      { id: 'exercise.fi.olla.negative.002', selectionOrder: 5 },
    ])
  })

  it('ships a complete first module with milestone reading texts', () => {
    expect(moduleOneLessons).toHaveLength(16)
    expect(moduleOneVocabulary).toHaveLength(407)
    expect(new Set(moduleOneVocabulary.map((item) => item.lemma)).size).toBe(
      407,
    )
    expect(
      moduleOneLessons.reduce(
        (total, lesson) => total + lesson.exercises.length,
        0,
      ),
    ).toBe(960)
    expect(preparedTexts).toHaveLength(5)
    expect(validateCourseContent().module).toEqual({
      lessonCount: 16,
      vocabularyCount: 407,
      uniqueLemmaCount: 407,
      exerciseCount: 960,
    })
  })

  it('provides a dictionary entry and morphology for every text word', () => {
    const tokens = preparedTexts.flatMap((text) => text.tokens)

    for (const text of preparedTexts.slice(0, 4)) {
      expect(text.tokens.length).toBeGreaterThanOrEqual(200)
    }
    expect(preparedTexts[4]?.tokens.length).toBeGreaterThanOrEqual(350)
    expect(tokens).toHaveLength(1257)
    expect(
      tokens.filter((token) => token.analysis.partOfSpeech === 'unknown'),
    ).toEqual([])
    expect(tokens.filter((token) => !token.lexicalSenseId)).toEqual([])
    expect(
      tokens.filter(
        (token) =>
          token.surface.toLocaleLowerCase('fi') !==
            token.lemma.toLocaleLowerCase('fi') &&
          !getFinnishTextFormTranslation(token.surface) &&
          !token.lexicalSenseId,
      ),
    ).toEqual([])
  })

  it('contains only forms recognized by Finnish morphology', async () => {
    await expect(validateFinnishMorphologyContent()).resolves.toMatchObject({
      checkedWordCount: expect.any(Number),
      generatedCandidateCount: 198,
      lemmaOverrideCount: expect.any(Number),
    })
  })
})
