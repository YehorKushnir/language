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
      'exercise.fi.present.common.first.001': 'Minä puhun suomea.',
      'exercise.fi.present.common.first.006': 'Minä luen kirjaa.',
      'exercise.fi.present.common.second-now.001': 'Sinä käytät nyt puhelinta.',
      'exercise.fi.present.common.third.001': 'Hän kysyy neuvoa.',
      'exercise.fi.present.common.first-plural-now.001':
        'Nyt me ymmärrämme kysymyksen.',
      'exercise.fi.present.common.third-plural-now.001':
        'He puhuvat nyt suomea.',
    })
  })

  it('uses natural translations while keeping similar verbs distinct', () => {
    const byId = new Map(
      presentCommonExercises.map((exercise) => [exercise.id, exercise]),
    )

    expect(byId.get('exercise.fi.present.common.first.001')?.prompt).toBe(
      'Я говорю по-фински.',
    )
    expect(byId.get('exercise.fi.present.common.first.004')?.prompt).toBe(
      'Я произношу «привет».',
    )
    expect(byId.get('exercise.fi.present.common.second-now.001')).toMatchObject(
      {
        prompt: 'Ты сейчас используешь телефон.',
        acceptedVariants: expect.arrayContaining([
          'Sinä käytät nyt puhelinta.',
          'Käytät nyt puhelinta.',
          'Nyt sinä käytät puhelinta.',
          'Nyt käytät puhelinta.',
        ]),
      },
    )
    expect(
      byId.get('exercise.fi.present.common.third-plural-now.001')
        ?.acceptedVariants,
    ).toEqual(['He puhuvat nyt suomea.', 'Nyt he puhuvat suomea.'])
    expect(
      presentCommonExercises.some((exercise) =>
        exercise.prompt.startsWith('Поставь '),
      ),
    ).toBe(false)
  })

  it('passes the strict lesson readiness gate', () => {
    const report = inspectMvpContentReadiness()
    expect(
      report.lessons.find((lesson) => lesson.lessonId === 'fi.present.common'),
    ).toEqual({ lessonId: 'fi.present.common', ready: true, issues: [] })
  })
})
