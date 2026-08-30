import { describe, expect, it } from 'vitest'

import { moduleOneLessons } from '../../../content/courses/ru-fi/module-one.js'

const reviewedLessons = moduleOneLessons.filter(
  (lesson) => lesson.id !== 'fi.questions.word-order',
)

describe('natural language across the other fifteen module-one lessons', () => {
  it('keeps every reviewed practice sentence free of known incoherent frames', () => {
    const exerciseText = reviewedLessons.flatMap((lesson) =>
      lesson.exercises.map(
        (exercise) => `${exercise.prompt}\n${exercise.targetText}`,
      ),
    )
    const forbiddenFragments = [
      'к месту «',
      'Здесь два предмета:',
      'Мы падаем',
      'Вы умираете',
      'Nyt Minä',
      'avaimen äiti',
      'kattilan televisio',
      'liikennevalolla',
      'liikennevalolle',
      'liikennevalolta',
    ]

    expect(reviewedLessons).toHaveLength(15)
    expect(exerciseText).toHaveLength(900)
    for (const fragment of forbiddenFragments) {
      expect(
        exerciseText.filter((text) => text.includes(fragment)),
        fragment,
      ).toEqual([])
    }
  })

  it('does not leave the present-tense drills as bare verbs', () => {
    const presentLessonIds = new Set([
      'fi.present.common',
      'fi.verb-types.two-three',
      'fi.verb-types.four-six',
    ])
    const presentExercises = reviewedLessons
      .filter((lesson) => presentLessonIds.has(lesson.id))
      .flatMap((lesson) => lesson.exercises)

    expect(presentExercises).toHaveLength(180)
    expect(
      presentExercises.filter(
        (exercise) => exercise.targetText.trim().split(/\s+/u).length < 2,
      ),
    ).toEqual([])
  })
})
