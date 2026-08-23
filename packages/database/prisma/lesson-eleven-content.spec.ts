import { describe, expect, it } from 'vitest'

import {
  partitiveUsageExercises,
  partitiveUsageGoldenExerciseIds,
  partitiveUsageVocabulary,
} from '../../../content/courses/ru-fi/lessons/fi.partitive.usage.js'

describe('lesson 11 curated content', () => {
  it('ships explicit partitives for the usage vocabulary', () => {
    expect(partitiveUsageVocabulary).toHaveLength(26)
    expect(
      partitiveUsageVocabulary.find((item) => item.lemma === 'rakkaus')?.forms,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ surface: 'rakkaus' }),
        expect.objectContaining({ surface: 'rakkautta' }),
      ]),
    )
  })

  it('keeps golden usage cases stable', () => {
    const golden = Object.fromEntries(
      partitiveUsageExercises
        .filter((exercise) =>
          partitiveUsageGoldenExerciseIds.includes(
            exercise.id as (typeof partitiveUsageGoldenExerciseIds)[number],
          ),
        )
        .map((exercise) => [exercise.id, exercise.targetText]),
    )

    expect(golden).toEqual({
      'exercise.fi.partitive.usage.word.1': 'Minä ajattelen musiikkia.',
      'exercise.fi.partitive.usage.word.4': 'Minä ajattelen taidetta.',
      'exercise.fi.partitive.usage.context.11': 'Minä en ajattele matkaa.',
      'exercise.fi.partitive.usage.context.19': 'Tässä on kaksi elokuvaa.',
      'exercise.fi.partitive.usage.pair.1': 'Ajatteletko sinä teatteria?',
    })
  })
})
