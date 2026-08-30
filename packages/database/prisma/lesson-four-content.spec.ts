import { describe, expect, it } from 'vitest'

import {
  verbTypesTwoThreeContent,
  verbTypesTwoThreeExercises,
  verbTypesTwoThreeGoldenExerciseIds,
  verbTypesTwoThreeVocabulary,
} from '../../../content/courses/ru-fi/lessons/fi.verb-types.two-three.js'
import { inspectMvpContentReadiness } from './mvp-content-readiness.js'

describe('lesson four: verb types two and three', () => {
  it('provides reviewed forms and separate knowledge targets', () => {
    expect(verbTypesTwoThreeContent.explanationScreens).toHaveLength(6)
    expect(verbTypesTwoThreeVocabulary).toHaveLength(26)
    expect(verbTypesTwoThreeExercises).toHaveLength(60)
    expect(
      new Set(verbTypesTwoThreeExercises.map((item) => item.primaryItemId)),
    ).toEqual(new Set(['grammar.fi.verb-type.2', 'grammar.fi.verb-type.3']))
  })

  it('keeps reviewed golden cases stable', () => {
    const golden = Object.fromEntries(
      verbTypesTwoThreeExercises
        .filter((exercise) =>
          verbTypesTwoThreeGoldenExerciseIds.includes(
            exercise.id as (typeof verbTypesTwoThreeGoldenExerciseIds)[number],
          ),
        )
        .map((exercise) => [exercise.id, exercise.targetText]),
    )

    expect(golden).toEqual({
      'exercise.fi.verb-types.two-three.first.001': 'Minä saan viestin.',
      'exercise.fi.verb-types.two-three.first.011': 'Minä teen ruokaa.',
      'exercise.fi.verb-types.two-three.second-now.001':
        'Sinä tulet nyt ajoissa.',
      'exercise.fi.verb-types.two-three.third.001': 'Hän juo vettä.',
      'exercise.fi.verb-types.two-three.first-plural-now.001':
        'Nyt me teemme ruokaa.',
      'exercise.fi.verb-types.two-three.third-plural-now.001':
        'He saavat nyt viestin.',
    })
  })

  it('accepts nyt before or after the inflected verb', () => {
    const byId = new Map(
      verbTypesTwoThreeExercises.map((exercise) => [exercise.id, exercise]),
    )

    expect(
      byId.get('exercise.fi.verb-types.two-three.second-now.001')
        ?.acceptedVariants,
    ).toEqual(
      expect.arrayContaining([
        'Sinä tulet nyt ajoissa.',
        'Tulet nyt ajoissa.',
        'Nyt sinä tulet ajoissa.',
        'Nyt tulet ajoissa.',
      ]),
    )
    expect(
      byId.get('exercise.fi.verb-types.two-three.third-plural-now.001')
        ?.acceptedVariants,
    ).toEqual(['He saavat nyt viestin.', 'Nyt he saavat viestin.'])
  })

  it('asks for sentence translations instead of naming Finnish forms', () => {
    const byId = new Map(
      verbTypesTwoThreeExercises.map((exercise) => [exercise.id, exercise]),
    )

    expect(byId.get('exercise.fi.verb-types.two-three.first.001')?.prompt).toBe(
      'Я получаю сообщение.',
    )
    expect(
      byId.get('exercise.fi.verb-types.two-three.second-now.001')?.prompt,
    ).toBe('Ты сейчас приходишь вовремя.')
    expect(
      verbTypesTwoThreeExercises.some((exercise) =>
        exercise.prompt.startsWith('Поставь '),
      ),
    ).toBe(false)
  })

  it('passes the strict lesson readiness gate', () => {
    expect(
      inspectMvpContentReadiness().lessons.find(
        (lesson) => lesson.lessonId === 'fi.verb-types.two-three',
      ),
    ).toEqual({
      lessonId: 'fi.verb-types.two-three',
      ready: true,
      issues: [],
    })
  })
})
