import { describe, expect, it } from 'vitest'

import {
  nounsGradationExercises,
  nounsGradationGoldenExerciseIds,
  nounsGradationVocabulary,
} from '../../../content/courses/ru-fi/lessons/fi.nouns.gradation.js'

describe('lesson 9 curated content', () => {
  it('ships nominative and reviewed genitive stems', () => {
    expect(nounsGradationVocabulary).toHaveLength(26)
    expect(
      nounsGradationVocabulary.find((item) => item.lemma === 'lamppu')?.forms,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ surface: 'lamppu' }),
        expect.objectContaining({ surface: 'lampun' }),
      ]),
    )
  })

  it('keeps golden noun-stem cases stable', () => {
    const golden = Object.fromEntries(
      nounsGradationExercises
        .filter((exercise) =>
          nounsGradationGoldenExerciseIds.includes(
            exercise.id as (typeof nounsGradationGoldenExerciseIds)[number],
          ),
        )
        .map((exercise) => [exercise.id, exercise.targetText]),
    )

    expect(golden).toEqual({
      'exercise.fi.nouns.gradation.word.1': 'Tämä on kirjan kansi.',
      'exercise.fi.nouns.gradation.word.5': 'Tämä on lampun valo.',
      'exercise.fi.nouns.gradation.context.1': 'Minulla on vihkon sivu.',
      'exercise.fi.nouns.gradation.context.19': 'Tämä ei ole kattilan kansi.',
      'exercise.fi.nouns.gradation.pair.1': 'Onko tämä kynän väri?',
    })
  })
})
