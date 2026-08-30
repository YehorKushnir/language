import { describe, expect, it } from 'vitest'

import {
  imperfectAffirmativeExercises,
  imperfectAffirmativeGoldenExerciseIds,
  imperfectAffirmativeVocabulary,
} from '../../../content/courses/ru-fi/lessons/fi.imperfect.affirmative.js'

describe('lesson 15 curated content', () => {
  it('ships reviewed object forms for the past-tense stories', () => {
    expect(imperfectAffirmativeVocabulary).toHaveLength(26)
    expect(
      imperfectAffirmativeVocabulary.find((item) => item.lemma === 'matkaopas')
        ?.forms,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ surface: 'matkaopas' }),
        expect.objectContaining({ surface: 'matkaoppaan' }),
      ]),
    )
  })

  it('keeps golden affirmative imperfect cases stable', () => {
    const golden = Object.fromEntries(
      imperfectAffirmativeExercises
        .filter((exercise) =>
          imperfectAffirmativeGoldenExerciseIds.includes(
            exercise.id as (typeof imperfectAffirmativeGoldenExerciseIds)[number],
          ),
        )
        .map((exercise) => [exercise.id, exercise.targetText]),
    )

    expect(golden).toEqual({
      'exercise.fi.imperfect.affirmative.word.1':
        'Eilen minä näin matkalaukun.',
      'exercise.fi.imperfect.affirmative.word.6': 'Eilen minä näin kartan.',
      'exercise.fi.imperfect.affirmative.context.1':
        'Viime viikolla minä löysin kartan.',
      'exercise.fi.imperfect.affirmative.context.11':
        'Hän näki lennon numeron eilen.',
      'exercise.fi.imperfect.affirmative.pair.1':
        'Sitten minä näin myös varauksen tiedot.',
    })
  })
})
