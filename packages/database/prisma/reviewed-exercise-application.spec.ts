import { describe, expect, it } from 'vitest'

import reviewedLessonSentences from '../../../content/courses/ru-fi/lesson-sentences.review.json' with { type: 'json' }
import { moduleOneLessons } from '../../../content/courses/ru-fi/module-one.js'

describe('reviewed exercise application', () => {
  it('uses every approved sentence and its reviewed order at runtime', () => {
    expect(moduleOneLessons).toHaveLength(16)

    for (const lesson of moduleOneLessons) {
      const lessonNumber = String(lesson.lessonPosition)
      const wrapper = reviewedLessonSentences[
        lesson.lessonPosition - 1
      ] as unknown as Record<
        string,
        Array<{
          order: number
          id: string
          prompt: string
          targetText: string
          acceptedVariants: string[]
        }>
      >
      const reviewed = wrapper[lessonNumber]!

      expect(lesson.exercises).toHaveLength(60)
      expect(
        lesson.exercises.map((exercise) => ({
          order: exercise.selectionOrder,
          id: exercise.id,
          prompt: exercise.prompt,
          targetText: exercise.targetText,
          acceptedVariants: exercise.acceptedVariants,
        })),
      ).toEqual(reviewed)
    }
  })

  it('labels only exercises that expect colloquial Finnish', () => {
    const reviewed = reviewedLessonSentences.flatMap((wrapper) =>
      Object.values(wrapper).flat(),
    )
    const colloquial = reviewed.filter((exercise) =>
      exercise.id.includes('.register.'),
    )

    expect(colloquial.map((exercise) => exercise.id).sort()).toEqual([
      'exercise.fi.olla.register.001',
      'exercise.fi.olla.register.002',
      'exercise.fi.olla.register.003',
      'exercise.fi.olla.register.004',
    ])
    expect(
      colloquial.every((exercise) =>
        exercise.prompt.startsWith('Напишите на разговорном:'),
      ),
    ).toBe(true)
    expect(
      reviewed
        .filter((exercise) => !exercise.id.includes('.register.'))
        .some((exercise) =>
          exercise.prompt.startsWith('Напишите на разговорном:'),
        ),
    ).toBe(false)
  })
})
