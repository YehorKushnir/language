import { describe, expect, it } from 'vitest'

import {
  infinitiveChainsExercises,
  infinitiveChainsGoldenExerciseIds,
  infinitiveChainsVocabulary,
} from '../../../content/courses/ru-fi/lessons/fi.infinitive.chains.js'

describe('lesson 7 curated content', () => {
  it('ships explicit infinitive and present forms', () => {
    expect(infinitiveChainsVocabulary).toHaveLength(26)
    expect(
      infinitiveChainsVocabulary.find((item) => item.lemma === 'voida')?.forms,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ surface: 'voida' }),
        expect.objectContaining({ surface: 'voin' }),
      ]),
    )
  })

  it('keeps the reviewed golden chains stable', () => {
    const golden = Object.fromEntries(
      infinitiveChainsExercises
        .filter((exercise) =>
          infinitiveChainsGoldenExerciseIds.includes(
            exercise.id as (typeof infinitiveChainsGoldenExerciseIds)[number],
          ),
        )
        .map((exercise) => [exercise.id, exercise.targetText]),
    )

    expect(golden).toEqual({
      'exercise.fi.infinitive.chains.word.1': 'Minä haluan voida auttaa.',
      'exercise.fi.infinitive.chains.word.2': 'Minä haluan tietää vastauksen.',
      'exercise.fi.infinitive.chains.context.11': 'Minä osaan matkustaa yksin.',
      'exercise.fi.infinitive.chains.context.19':
        'Minä en voi matkustaa yksin.',
      'exercise.fi.infinitive.chains.pair.1': 'Haluatko sinä laulaa laulun?',
    })
  })
})
