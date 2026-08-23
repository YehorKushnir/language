import { describe, expect, it } from 'vitest'

import {
  realizeFinnishPreparedVariation,
  validateFinnishPreparedVariationTemplate,
} from './prepared-variation-realizer.js'

const definition = {
  schemaVersion: 1 as const,
  frame: 'prepared-variation' as const,
  lessonId: 'fi.present.common',
  sourceLanguage: 'ru' as const,
  targetLanguage: 'fi' as const,
  exerciseIds: ['exercise.fi.present.common.word.1'],
  supportedItemIds: ['grammar.fi.present.common', 'word.fi.m1.02.01'],
}

const source = {
  exerciseId: 'exercise.fi.present.common.word.1',
  prompt: 'Я говорю по-фински.',
  targetText: 'Minä puhun suomea.',
  acceptedVariants: ['Minä puhun suomea.', 'Puhun suomea.'],
  slots: [
    {
      role: 'subject',
      accepted: ['minä'],
      itemIds: ['grammar.fi.present.common'],
      optional: true,
    },
    {
      role: 'verb',
      accepted: ['puhun'],
      itemIds: ['grammar.fi.present.common', 'word.fi.m1.02.01'],
    },
  ],
}

describe('Finnish prepared variation realizer', () => {
  it('selects a reviewed answer variant without changing its AnswerSpec', () => {
    expect(
      realizeFinnishPreparedVariation(definition, source, {
        exerciseId: source.exerciseId,
        variantIndex: 1,
      }),
    ).toEqual({
      parameters: { exerciseId: source.exerciseId, variantIndex: 1 },
      sourceExerciseId: source.exerciseId,
      prompt: source.prompt,
      targetText: 'Puhun suomea.',
      acceptedVariants: source.acceptedVariants,
      slots: source.slots,
    })
  })

  it('rejects an exercise outside the curated template', () => {
    expect(() =>
      realizeFinnishPreparedVariation(
        definition,
        { ...source, exerciseId: 'exercise.unknown' },
        { exerciseId: 'exercise.unknown', variantIndex: 0 },
      ),
    ).toThrow(/not enabled/u)
  })

  it('rejects malformed persisted template JSON', () => {
    expect(() =>
      validateFinnishPreparedVariationTemplate({
        ...definition,
        supportedItemIds: [],
      }),
    ).toThrow(/knowledge item ids/u)
  })
})
