import { describe, expect, it } from 'vitest'

import {
  externalCasesExercises,
  externalCasesGoldenExerciseIds,
  externalCasesVocabulary,
} from '../../../content/courses/ru-fi/lessons/fi.local-cases.external.js'

describe('lesson 13 curated content', () => {
  it('distinguishes transport, external places and lexical exceptions', () => {
    expect(externalCasesVocabulary).toHaveLength(26)
    expect(
      externalCasesVocabulary.find((item) => item.lemma === 'järvi')?.forms,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ surface: 'järvellä' }),
        expect.objectContaining({ surface: 'järvelle' }),
        expect.objectContaining({ surface: 'järveltä' }),
      ]),
    )
    expect(
      externalCasesVocabulary.find((item) => item.lemma === 'metsä')?.forms,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ surface: 'metsässä' }),
      ]),
    )
  })

  it('keeps golden external-case examples stable', () => {
    const golden = Object.fromEntries(
      externalCasesExercises
        .filter((exercise) =>
          externalCasesGoldenExerciseIds.includes(
            exercise.id as (typeof externalCasesGoldenExerciseIds)[number],
          ),
        )
        .map((exercise) => [exercise.id, exercise.targetText]),
    )

    expect(golden).toEqual({
      'exercise.fi.local-cases.external.word.1': 'Minä matkustan bussilla.',
      'exercise.fi.local-cases.external.word.13': 'Minä olen järvellä.',
      'exercise.fi.local-cases.external.context.1': 'Minä menen tielle.',
      'exercise.fi.local-cases.external.context.11': 'Nyt minä tulen tieltä.',
      'exercise.fi.local-cases.external.pair.1': 'Oletko sinä tiellä?',
    })
  })
})
