import { describe, expect, it } from 'vitest'

import {
  realizeFinnishIdentity,
  validateFinnishIdentityTemplate,
  type FinnishIdentityTemplateDefinition,
} from './identity-realizer.js'

const definition: FinnishIdentityTemplateDefinition = {
  schemaVersion: 1,
  frame: 'identity',
  lessonId: 'fi.olla.basics',
  sourceLanguage: 'ru',
  targetLanguage: 'fi',
  personKeys: ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'],
  grammarItems: {
    affirmative: 'grammar.fi.olla.affirmative',
    negative: 'grammar.fi.olla.negative',
    question: 'grammar.fi.olla.question',
  },
  complements: [
    {
      key: 'student',
      itemId: 'word.fi.opiskelija.person',
      singular: 'opiskelija',
      plural: 'opiskelijoita',
      sourceSingular: 'студент',
      sourcePlural: 'студенты',
    },
  ],
}

describe('realizeFinnishIdentity', () => {
  it('realizes affirmative, negative and question frames', () => {
    expect(
      realizeFinnishIdentity(definition, {
        category: 'affirmative',
        person: '1sg',
        complementKey: 'student',
      }),
    ).toMatchObject({
      targetText: 'Minä olen opiskelija.',
      acceptedVariants: ['Minä olen opiskelija.', 'Olen opiskelija.'],
    })
    expect(
      realizeFinnishIdentity(definition, {
        category: 'negative',
        person: '3sg',
        complementKey: 'student',
      }),
    ).toMatchObject({
      targetText: 'Hän ei ole opiskelija.',
      acceptedVariants: ['Hän ei ole opiskelija.'],
    })
    expect(
      realizeFinnishIdentity(definition, {
        category: 'question',
        person: '2sg',
        complementKey: 'student',
      }),
    ).toMatchObject({
      targetText: 'Oletko sinä opiskelija?',
      acceptedVariants: ['Oletko sinä opiskelija?', 'Oletko opiskelija?'],
    })
  })

  it('selects the plural complement and maps evidence by slot', () => {
    const exercise = realizeFinnishIdentity(definition, {
      category: 'negative',
      person: '3pl',
      complementKey: 'student',
    })

    expect(exercise.targetText).toBe('He eivät ole opiskelijoita.')
    expect(exercise.slots.at(-1)).toEqual({
      role: 'complement',
      accepted: ['opiskelijoita'],
      itemIds: ['word.fi.opiskelija.person'],
    })
    expect(exercise.slots[1]?.itemIds).toEqual(['grammar.fi.olla.negative'])
  })

  it('marks only omittable personal-pronoun slots as optional', () => {
    const firstPerson = realizeFinnishIdentity(definition, {
      category: 'affirmative',
      person: '1sg',
      complementKey: 'student',
    })
    const thirdPerson = realizeFinnishIdentity(definition, {
      category: 'affirmative',
      person: '3sg',
      complementKey: 'student',
    })

    expect(firstPerson.slots[0]).toMatchObject({
      role: 'subject',
      accepted: ['minä'],
      optional: true,
    })
    expect(thirdPerson.slots[0]).toMatchObject({
      role: 'subject',
      accepted: ['hän'],
    })
    expect(thirdPerson.slots[0]?.optional).toBe(false)
  })

  it('rejects malformed persisted template JSON', () => {
    expect(() =>
      validateFinnishIdentityTemplate({
        ...definition,
        personKeys: ['4sg'],
      }),
    ).toThrow('unsupported person')
    expect(() =>
      validateFinnishIdentityTemplate({
        ...definition,
        complements: [{ ...definition.complements[0], singular: 42 }],
      }),
    ).toThrow('is incomplete')
  })
})
