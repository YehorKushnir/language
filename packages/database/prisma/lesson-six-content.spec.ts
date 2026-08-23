import { describe, expect, it } from 'vitest'

import {
  consonantGradationExercises,
  consonantGradationGoldenExerciseIds,
  consonantGradationVocabulary,
} from '../../../content/courses/ru-fi/lessons/fi.consonant-gradation.js'

describe('lesson 6 curated content', () => {
  it('keeps useful strong and weak forms for the lesson vocabulary', () => {
    expect(consonantGradationVocabulary).toHaveLength(26)
    expect(
      consonantGradationVocabulary.find((item) => item.lemma === 'kauppa')
        ?.forms,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ surface: 'kauppa' }),
        expect.objectContaining({ surface: 'kaupan' }),
      ]),
    )
  })

  it('keeps the reviewed golden cases stable', () => {
    const golden = Object.fromEntries(
      consonantGradationExercises
        .filter((exercise) =>
          consonantGradationGoldenExerciseIds.includes(
            exercise.id as (typeof consonantGradationGoldenExerciseIds)[number],
          ),
        )
        .map((exercise) => [exercise.id, exercise.targetText]),
    )

    expect(golden).toEqual({
      'exercise.fi.consonant-gradation.word.1': 'Tämä on kauppa. Minä luen.',
      'exercise.fi.consonant-gradation.word.2':
        'Tämä on matto. Sinä kirjoitat.',
      'exercise.fi.consonant-gradation.context.1':
        'Tämä on kauppa. Hän auttaa.',
      'exercise.fi.consonant-gradation.pair.1': 'Tämä on kauppa. Minä en lue.',
      'exercise.fi.consonant-gradation.pair.5': 'Tämä on kukka. Annatko sinä?',
    })
  })
})
