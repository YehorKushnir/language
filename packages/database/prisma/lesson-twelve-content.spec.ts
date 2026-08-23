import { describe, expect, it } from 'vitest'

import {
  internalCasesExercises,
  internalCasesGoldenExerciseIds,
  internalCasesVocabulary,
} from '../../../content/courses/ru-fi/lessons/fi.local-cases.internal.js'

describe('lesson 12 curated content', () => {
  it('ships location, direction and origin forms', () => {
    expect(internalCasesVocabulary).toHaveLength(26)
    expect(
      internalCasesVocabulary.find((item) => item.lemma === 'koulu')?.forms,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ surface: 'koulussa' }),
        expect.objectContaining({ surface: 'kouluun' }),
        expect.objectContaining({ surface: 'koulusta' }),
      ]),
    )
  })

  it('keeps golden local-case cases stable', () => {
    const golden = Object.fromEntries(
      internalCasesExercises
        .filter((exercise) =>
          internalCasesGoldenExerciseIds.includes(
            exercise.id as (typeof internalCasesGoldenExerciseIds)[number],
          ),
        )
        .map((exercise) => [exercise.id, exercise.targetText]),
    )

    expect(golden).toEqual({
      'exercise.fi.local-cases.internal.word.1': 'Minä olen koulussa.',
      'exercise.fi.local-cases.internal.word.10': 'Minä olen asemalla.',
      'exercise.fi.local-cases.internal.context.1': 'Minä menen kahvilaan.',
      'exercise.fi.local-cases.internal.context.11':
        'Nyt minä tulen tehtaasta.',
      'exercise.fi.local-cases.internal.pair.1': 'Oletko sinä kirjastossa?',
    })
  })
})
