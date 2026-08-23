import { describe, expect, it } from 'vitest'

import {
  verbTypesFourSixContent,
  verbTypesFourSixExercises,
  verbTypesFourSixGoldenExerciseIds,
  verbTypesFourSixVocabulary,
} from '../../../content/courses/ru-fi/lessons/fi.verb-types.four-six.js'
import { inspectMvpContentReadiness } from './mvp-content-readiness.js'

describe('lesson five: verb types four through six', () => {
  it('provides forms and separate knowledge targets for all three types', () => {
    expect(verbTypesFourSixContent.explanationScreens).toHaveLength(6)
    expect(verbTypesFourSixVocabulary).toHaveLength(26)
    expect(verbTypesFourSixExercises).toHaveLength(60)
    expect(
      new Set(verbTypesFourSixExercises.map((item) => item.primaryItemId)),
    ).toEqual(
      new Set([
        'grammar.fi.verb-type.4',
        'grammar.fi.verb-type.5',
        'grammar.fi.verb-type.6',
      ]),
    )
  })

  it('keeps reviewed golden cases stable', () => {
    const golden = Object.fromEntries(
      verbTypesFourSixExercises
        .filter((exercise) =>
          verbTypesFourSixGoldenExerciseIds.includes(
            exercise.id as (typeof verbTypesFourSixGoldenExerciseIds)[number],
          ),
        )
        .map((exercise) => [exercise.id, exercise.targetText]),
    )

    expect(golden).toEqual({
      'exercise.fi.verb-types.four-six.first.001': 'Minä haluan.',
      'exercise.fi.verb-types.four-six.first.010': 'Minä tarvitsen.',
      'exercise.fi.verb-types.four-six.second-now.001': 'Sinä palaat nyt.',
      'exercise.fi.verb-types.four-six.third.001': 'Hän tapaa.',
      'exercise.fi.verb-types.four-six.first-plural-now.001':
        'Nyt me pakkaamme.',
      'exercise.fi.verb-types.four-six.third-plural-now.001':
        'He haluavat nyt.',
    })
  })

  it('passes the strict lesson readiness gate', () => {
    expect(
      inspectMvpContentReadiness().lessons.find(
        (lesson) => lesson.lessonId === 'fi.verb-types.four-six',
      ),
    ).toEqual({
      lessonId: 'fi.verb-types.four-six',
      ready: true,
      issues: [],
    })
  })
})
