import { describe, expect, it } from 'vitest'

import {
  genitivePossessionExercises,
  genitivePossessionGoldenExerciseIds,
  genitivePossessionVocabulary,
} from '../../../content/courses/ru-fi/lessons/fi.genitive.possession.js'

describe('lesson 8 curated content', () => {
  it('ships nominative, genitive and partitive forms', () => {
    expect(genitivePossessionVocabulary).toHaveLength(26)
    expect(
      genitivePossessionVocabulary.find((item) => item.lemma === 'avain')
        ?.forms,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ surface: 'avain' }),
        expect.objectContaining({ surface: 'avaimen' }),
        expect.objectContaining({ surface: 'avainta' }),
      ]),
    )
  })

  it('keeps the reviewed golden possession cases stable', () => {
    const golden = Object.fromEntries(
      genitivePossessionExercises
        .filter((exercise) =>
          genitivePossessionGoldenExerciseIds.includes(
            exercise.id as (typeof genitivePossessionGoldenExerciseIds)[number],
          ),
        )
        .map((exercise) => [exercise.id, exercise.targetText]),
    )

    expect(golden).toEqual({
      'exercise.fi.genitive.possession.word.1': 'Tämä on perheen lapsi.',
      'exercise.fi.genitive.possession.word.2': 'Tämä on äidin vauva.',
      'exercise.fi.genitive.possession.context.1': 'Minulla on perhe.',
      'exercise.fi.genitive.possession.context.21': 'Tänään hänellä on sisko.',
      'exercise.fi.genitive.possession.pair.1': 'Onko sinulla huone?',
    })
  })
})
