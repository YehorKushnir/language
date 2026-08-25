import { describe, expect, it } from 'vitest'

import {
  presentCommonContent,
  presentCommonExercises,
  presentCommonGoldenExerciseIds,
  presentCommonVocabulary,
} from '../../../content/courses/ru-fi/lessons/fi.present.common.js'
import { inspectMvpContentReadiness } from './mvp-content-readiness.js'

describe('lesson two: present tense type one verbs', () => {
  it('contains curated explanation, vocabulary forms and 60 exercises', () => {
    expect(presentCommonContent.explanationScreens).toHaveLength(6)
    expect(presentCommonVocabulary).toHaveLength(26)
    expect(presentCommonExercises).toHaveLength(60)
    expect(
      presentCommonVocabulary.every((item) => item.forms.length >= 4),
    ).toBe(true)
    expect(
      presentCommonExercises.every(
        (exercise) => exercise.primaryItemId === 'grammar.fi.present.common',
      ),
    ).toBe(true)
  })

  it('keeps the reviewed golden cases stable', () => {
    const golden = new Map(
      presentCommonExercises
        .filter((exercise) =>
          presentCommonGoldenExerciseIds.includes(
            exercise.id as (typeof presentCommonGoldenExerciseIds)[number],
          ),
        )
        .map((exercise) => [exercise.id, exercise.targetText]),
    )

    expect(Object.fromEntries(golden)).toEqual({
      'exercise.fi.present.common.first.001': 'Minä puhun.',
      'exercise.fi.present.common.first.006': 'Minä luen.',
      'exercise.fi.present.common.second-now.001': 'Sinä käytät nyt.',
      'exercise.fi.present.common.third.001': 'Hän kysyy.',
      'exercise.fi.present.common.first-plural-now.001': 'Nyt me ymmärrämme.',
      'exercise.fi.present.common.third-plural-now.001': 'He puhuvat nyt.',
    })
  })

  it('names the intended verb instead of asking for an ambiguous translation', () => {
    const byId = new Map(
      presentCommonExercises.map((exercise) => [exercise.id, exercise]),
    )

    expect(byId.get('exercise.fi.present.common.first.001')?.prompt).toBe(
      'Поставь puhua («говорить») в форму minä.',
    )
    expect(byId.get('exercise.fi.present.common.first.004')?.prompt).toBe(
      'Поставь sanoa («сказать») в форму minä.',
    )
    expect(byId.get('exercise.fi.present.common.second-now.001')).toMatchObject(
      {
        prompt: 'Поставь käyttää («использовать») в форму sinä и добавь nyt.',
        acceptedVariants: expect.arrayContaining([
          'Sinä käytät nyt.',
          'Käytät nyt.',
          'Nyt sinä käytät.',
          'Nyt käytät.',
        ]),
      },
    )
    expect(
      byId.get('exercise.fi.present.common.third-plural-now.001')
        ?.acceptedVariants,
    ).toEqual(['He puhuvat nyt.', 'Nyt he puhuvat.'])
  })

  it('passes the strict lesson readiness gate', () => {
    const report = inspectMvpContentReadiness()
    expect(
      report.lessons.find((lesson) => lesson.lessonId === 'fi.present.common'),
    ).toEqual({ lessonId: 'fi.present.common', ready: true, issues: [] })
  })
})
