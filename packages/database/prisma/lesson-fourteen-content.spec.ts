import { describe, expect, it } from 'vitest'

import {
  pluralAgreementExercises,
  pluralAgreementGoldenExerciseIds,
  pluralAgreementVocabulary,
} from '../../../content/courses/ru-fi/lessons/fi.plural.agreement.js'

describe('lesson 14 curated content', () => {
  it('ships reviewed singular and plural adjective forms', () => {
    expect(pluralAgreementVocabulary).toHaveLength(26)
    expect(
      pluralAgreementVocabulary.find((item) => item.lemma === 'lämmin')?.forms,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ surface: 'lämmin' }),
        expect.objectContaining({ surface: 'lämpimät' }),
      ]),
    )
  })

  it('keeps golden agreement cases stable', () => {
    const golden = Object.fromEntries(
      pluralAgreementExercises
        .filter((exercise) =>
          pluralAgreementGoldenExerciseIds.includes(
            exercise.id as (typeof pluralAgreementGoldenExerciseIds)[number],
          ),
        )
        .map((exercise) => [exercise.id, exercise.targetText]),
    )
    expect(golden).toEqual({
      'exercise.fi.plural.agreement.word.1': 'Suuret talot ovat kaupungissa.',
      'exercise.fi.plural.agreement.word.7': 'Uudet autot ovat ulkona.',
      'exercise.fi.plural.agreement.context.1':
        'Nämä nuoret opiskelijat ovat yliopistossa.',
      'exercise.fi.plural.agreement.context.11':
        'Uudet autot eivät ole ulkona.',
      'exercise.fi.plural.agreement.pair.1': 'Ovatko pitkät päivät kesällä?',
    })
  })
})
