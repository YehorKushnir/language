import {
  realizeFinnishPreparedVariation,
  validateFinnishPreparedVariationTemplate,
} from '@language/language-fi'
import { describe, expect, it } from 'vitest'

import { moduleOneLessons } from '../../../content/courses/ru-fi/module-one.js'

describe('module-one exercise template coverage', () => {
  it('gives every lesson a curated generation template', () => {
    expect(moduleOneLessons).toHaveLength(16)
    expect(moduleOneLessons.every((lesson) => lesson.template)).toBe(true)
    expect(
      new Set(moduleOneLessons.map((lesson) => lesson.templateId)).size,
    ).toBe(16)
  })

  it('covers every knowledge item from lessons 2 through 16', () => {
    for (const lesson of moduleOneLessons.slice(1)) {
      const definition = lesson.template
      validateFinnishPreparedVariationTemplate(definition)

      const expectedItemIds = [
        ...lesson.skills.map((skill) => skill.id),
        ...lesson.vocabulary.map((item) => item.itemId),
      ]
      const testedItemIds = new Set(
        lesson.exercises.flatMap((exercise) => [
          exercise.primaryItemId,
          ...exercise.secondaryItemIds,
          exercise.vocabularyItemId,
        ]),
      )

      expect(definition.lessonId).toBe(lesson.id)
      expect(definition.exerciseIds).toEqual(
        lesson.exercises.map((exercise) => exercise.id),
      )
      expect(definition.supportedItemIds).toEqual(expectedItemIds)
      expect(expectedItemIds.every((itemId) => testedItemIds.has(itemId))).toBe(
        true,
      )
    }
  })

  it('realizes every reviewed answer variant deterministically', () => {
    let candidateCount = 0

    for (const lesson of moduleOneLessons.slice(1)) {
      const definition = lesson.template
      validateFinnishPreparedVariationTemplate(definition)

      for (const exercise of lesson.exercises) {
        for (
          let variantIndex = 0;
          variantIndex < exercise.acceptedVariants.length;
          variantIndex += 1
        ) {
          const candidate = realizeFinnishPreparedVariation(
            definition,
            {
              exerciseId: exercise.id,
              prompt: exercise.prompt,
              targetText: exercise.targetText,
              acceptedVariants: exercise.acceptedVariants,
              slots: exercise.slots,
            },
            { exerciseId: exercise.id, variantIndex },
          )

          expect(candidate.targetText).toBe(
            exercise.acceptedVariants[variantIndex],
          )
          candidateCount += 1
        }
      }
    }

    expect(candidateCount).toBeGreaterThan(900)
  })
})
