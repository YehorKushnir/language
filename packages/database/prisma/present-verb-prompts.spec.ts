import { describe, expect, it } from 'vitest'

import { presentCommonExercises } from '../../../content/courses/ru-fi/lessons/fi.present.common.js'
import { verbTypesFourSixExercises } from '../../../content/courses/ru-fi/lessons/fi.verb-types.four-six.js'
import { verbTypesTwoThreeExercises } from '../../../content/courses/ru-fi/lessons/fi.verb-types.two-three.js'

const exercises = [
  ...presentCommonExercises,
  ...verbTypesTwoThreeExercises,
  ...verbTypesFourSixExercises,
]

describe('present-tense translation prompts', () => {
  it('uses Russian sentences instead of Finnish conjugation instructions', () => {
    expect(exercises).toHaveLength(180)
    expect(
      exercises.some((exercise) => exercise.prompt.startsWith('Поставь ')),
    ).toBe(false)
  })

  it('never maps one Russian prompt to competing Finnish answers', () => {
    const prompts = exercises.map((exercise) => exercise.prompt)
    expect(new Set(prompts).size).toBe(prompts.length)
  })

  it('distinguishes speech and learning verbs in Russian', () => {
    const promptByTarget = new Map(
      exercises.map((exercise) => [exercise.targetText, exercise.prompt]),
    )

    expect(promptByTarget.get('Minä puhun suomea.')).toBe('Я говорю по-фински.')
    expect(promptByTarget.get('Minä sanon hei.')).toBe('Я произношу «привет».')
    expect(promptByTarget.get('Minä opin suomea.')).toBe('Я учу финский язык.')
    expect(promptByTarget.get('Sinä opiskelet nyt suomea.')).toBe(
      'Ты сейчас изучаешь финский язык.',
    )
  })
})
