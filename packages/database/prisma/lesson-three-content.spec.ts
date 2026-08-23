import { describe, expect, it } from 'vitest'

import {
  questionsWordOrderContent,
  questionsWordOrderExercises,
  questionsWordOrderGoldenExerciseIds,
  questionsWordOrderVocabulary,
} from '../../../content/courses/ru-fi/lessons/fi.questions.word-order.js'
import { inspectMvpContentReadiness } from './mvp-content-readiness.js'

describe('lesson three: negative, questions and word order', () => {
  it('contains the three separate grammar targets', () => {
    expect(questionsWordOrderContent.explanationScreens).toHaveLength(6)
    expect(questionsWordOrderVocabulary).toHaveLength(26)
    expect(questionsWordOrderExercises).toHaveLength(60)
    expect(
      new Set(questionsWordOrderExercises.map((item) => item.primaryItemId)),
    ).toEqual(
      new Set([
        'grammar.fi.present.negative',
        'grammar.fi.present.question',
        'grammar.fi.questions.word-order',
      ]),
    )
  })

  it('keeps reviewed golden cases stable', () => {
    const golden = Object.fromEntries(
      questionsWordOrderExercises
        .filter((exercise) =>
          questionsWordOrderGoldenExerciseIds.includes(
            exercise.id as (typeof questionsWordOrderGoldenExerciseIds)[number],
          ),
        )
        .map((exercise) => [exercise.id, exercise.targetText]),
    )

    expect(golden).toEqual({
      'exercise.fi.questions.yes-no.001': 'Onko tämä kysymys?',
      'exercise.fi.questions.negative.001': 'Tämä ei ole puhelin.',
      'exercise.fi.questions.existential.001': 'Tässä on merkitys.',
      'exercise.fi.questions.absent.001': 'Viesti ei ole tässä.',
      'exercise.fi.questions.location.001': 'Onko uutinen tässä?',
    })
  })

  it('passes the strict lesson readiness gate', () => {
    expect(
      inspectMvpContentReadiness().lessons.find(
        (lesson) => lesson.lessonId === 'fi.questions.word-order',
      ),
    ).toEqual({ lessonId: 'fi.questions.word-order', ready: true, issues: [] })
  })
})
