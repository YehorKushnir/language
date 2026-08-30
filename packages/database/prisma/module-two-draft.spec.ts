import { validateLessonBundle } from '@language/content-schema'
import { describe, expect, it } from 'vitest'

import { moduleOneLessons } from '../../../content/courses/ru-fi/module-one.js'
import {
  moduleTwoDraftLessons,
  moduleTwoDraftVocabulary,
} from '../../../content/courses/ru-fi/module-two.js'
import {
  moduleTwoLessonPlan,
  moduleTwoTextPlan,
  moduleTwoVocabularyBudget,
} from '../../../content/courses/ru-fi/module-two-plan.js'

describe('module two draft', () => {
  it('locks the 500-word budget across lessons and milestone texts', () => {
    expect(moduleTwoLessonPlan).toHaveLength(16)
    expect(
      moduleTwoLessonPlan.map((lesson) => lesson.courseLessonNumber),
    ).toEqual(Array.from({ length: 16 }, (_, index) => index + 17))
    expect(
      moduleTwoLessonPlan.every(
        (lesson) => lesson.activeVocabularyTarget === 26,
      ),
    ).toBe(true)
    expect(moduleTwoTextPlan).toHaveLength(5)
    expect(moduleTwoVocabularyBudget).toEqual({
      lessonVocabulary: 416,
      textOnlyVocabulary: 84,
      total: 500,
    })
  })

  it('builds lessons 17 and 18 and covers every new word in its lesson', () => {
    expect(moduleTwoDraftLessons).toHaveLength(2)
    expect(moduleTwoDraftLessons.map((lesson) => lesson.id)).toEqual([
      'fi.object.boundedness',
      'fi.object.total.forms',
    ])
    expect(moduleTwoDraftVocabulary).toHaveLength(52)

    const allowedVocabularyIds = moduleOneLessons.flatMap((candidate) =>
      candidate.vocabulary.map((item) => item.itemId),
    )

    moduleTwoDraftLessons.forEach((lesson, lessonIndex) => {
      allowedVocabularyIds.push(...lesson.vocabulary.map((item) => item.itemId))

      expect(lesson.modulePosition).toBe(2)
      expect(lesson.lessonPosition).toBe(lessonIndex + 1)
      expect(lesson.vocabulary).toHaveLength(26)
      expect(lesson.exercises).toHaveLength(60)
      const assignedVocabularyIds = new Set(
        lesson.exercises.map((exercise) => exercise.vocabularyItemId),
      )
      expect(
        lesson.vocabulary.every((item) =>
          assignedVocabularyIds.has(item.itemId),
        ),
      ).toBe(true)

      expect(() =>
        validateLessonBundle(
          {
            lessonId: lesson.id,
            content: lesson.content,
            vocabulary: lesson.vocabulary,
            exercises: lesson.exercises,
          },
          {
            allowedVocabularyItemIds: [...allowedVocabularyIds],
            expectedExerciseCount: 60,
            minimumExampleCount: 12,
            minimumVocabularyCount: 26,
          },
        ),
      ).not.toThrow()
    })
  })

  it('keeps the reviewed practice order mixed', () => {
    for (const lesson of moduleTwoDraftLessons) {
      let previousKind = ''
      let runLength = 0
      let longestRun = 0

      for (const exercise of lesson.exercises) {
        const kind = exerciseKind(exercise.id)
        runLength = kind === previousKind ? runLength + 1 : 1
        previousKind = kind
        longestRun = Math.max(longestRun, runLength)
      }

      expect(longestRun).toBeLessThanOrEqual(2)
    }
  })

  it('does not repeat vocabulary from module one or between draft lessons', () => {
    const allVocabulary = [
      ...moduleOneLessons.flatMap((lesson) => lesson.vocabulary),
      ...moduleTwoDraftVocabulary,
    ]
    const normalizedLemmas = allVocabulary.map((item) =>
      item.lemma.normalize('NFC').toLocaleLowerCase('fi'),
    )
    const itemIds = allVocabulary.map((item) => item.itemId)

    expect(new Set(normalizedLemmas)).toHaveLength(normalizedLemmas.length)
    expect(new Set(itemIds)).toHaveLength(itemIds.length)
  })
})

function exerciseKind(exerciseId: string) {
  for (const kind of [
    'negative',
    'partitive',
    'contrast',
    'singular',
    'plural',
  ]) {
    if (exerciseId.includes(`.${kind}.`)) return kind
  }
  return 'total'
}
