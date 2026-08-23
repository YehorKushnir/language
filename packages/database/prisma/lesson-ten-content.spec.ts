import { describe, expect, it } from 'vitest'

import {
  partitiveFormationExercises,
  partitiveFormationGoldenExerciseIds,
  partitiveFormationVocabulary,
} from '../../../content/courses/ru-fi/lessons/fi.partitive.formation.js'

describe('lesson 10 curated content', () => {
  it('ships explicit nominative and partitive forms', () => {
    expect(partitiveFormationVocabulary).toHaveLength(26)
    expect(
      partitiveFormationVocabulary.find((item) => item.lemma === 'vesi')?.forms,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ surface: 'vesi' }),
        expect.objectContaining({ surface: 'vettä' }),
      ]),
    )
  })

  it('keeps golden formation cases stable', () => {
    const golden = Object.fromEntries(
      partitiveFormationExercises
        .filter((exercise) =>
          partitiveFormationGoldenExerciseIds.includes(
            exercise.id as (typeof partitiveFormationGoldenExerciseIds)[number],
          ),
        )
        .map((exercise) => [exercise.id, exercise.targetText]),
    )

    expect(golden).toEqual({
      'exercise.fi.partitive.formation.word.1': 'Minä haluan leipää.',
      'exercise.fi.partitive.formation.word.3': 'Minä haluan vettä.',
      'exercise.fi.partitive.formation.context.1': 'Minä ostan tänään mehua.',
      'exercise.fi.partitive.formation.context.11': 'Minä en halua riisiä.',
      'exercise.fi.partitive.formation.pair.1': 'Haluatko sinä kahvia?',
    })
  })
})
