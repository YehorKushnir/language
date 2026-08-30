import { describe, expect, it } from 'vitest'

import {
  imperfectNegativeQuestionExercises,
  imperfectNegativeQuestionGoldenExerciseIds,
  imperfectNegativeQuestionVocabulary,
} from '../../../content/courses/ru-fi/lessons/fi.imperfect.negative-question.js'

describe('lesson 16 curated content', () => {
  it('ships reviewed imperfect and participle forms', () => {
    expect(imperfectNegativeQuestionVocabulary).toHaveLength(26)
    expect(
      imperfectNegativeQuestionVocabulary.find(
        (item) => item.lemma === 'lähteä',
      )?.forms,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ surface: 'lähdin' }),
        expect.objectContaining({ surface: 'lähti' }),
        expect.objectContaining({ surface: 'lähtenyt' }),
        expect.objectContaining({ surface: 'lähteneet' }),
      ]),
    )
  })

  it('keeps golden negative and question cases stable', () => {
    const golden = Object.fromEntries(
      imperfectNegativeQuestionExercises
        .filter((exercise) =>
          imperfectNegativeQuestionGoldenExerciseIds.includes(
            exercise.id as (typeof imperfectNegativeQuestionGoldenExerciseIds)[number],
          ),
        )
        .map((exercise) => [exercise.id, exercise.targetText]),
    )

    expect(golden).toEqual({
      'exercise.fi.imperfect.negative-question.word.1':
        'Eilen minä en lähtenyt kotoa.',
      'exercise.fi.imperfect.negative-question.word.10':
        'Se ei kasvanut kylmän takia.',
      'exercise.fi.imperfect.negative-question.context.1':
        'Me emme lähteneet kotoa.',
      'exercise.fi.imperfect.negative-question.context.11':
        'Katositko sinä näkyvistä?',
      'exercise.fi.imperfect.negative-question.pair.1':
        'Hän ei nukkunut hyvin eilen.',
    })
  })
})
