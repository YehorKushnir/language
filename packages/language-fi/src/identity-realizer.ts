export type FinnishIdentityCategory = 'affirmative' | 'negative' | 'question'

export type FinnishIdentityPerson =
  '1sg' | '2sg' | '3sg' | '1pl' | '2pl' | '3pl'

export interface FinnishIdentityComplement {
  key: string
  itemId: string
  singular: string
  plural: string
  sourceSingular: string
  sourcePlural: string
}

export interface FinnishIdentityTemplateDefinition {
  schemaVersion: 1
  frame: 'identity'
  lessonId: string
  sourceLanguage: 'ru'
  targetLanguage: 'fi'
  personKeys: FinnishIdentityPerson[]
  grammarItems: Record<FinnishIdentityCategory, string>
  complements: FinnishIdentityComplement[]
}

export interface FinnishIdentityParameters {
  category: FinnishIdentityCategory
  person: FinnishIdentityPerson
  complementKey: string
}

export interface FinnishGeneratedAnswerSlot {
  role: string
  accepted: string[]
  itemIds: string[]
  optional?: boolean
}

export interface FinnishGeneratedIdentityExercise {
  parameters: FinnishIdentityParameters
  prompt: string
  targetText: string
  acceptedVariants: string[]
  slots: FinnishGeneratedAnswerSlot[]
  grammarItemId: string
  vocabularyItemId: string
}

interface PersonRealization {
  pronoun: string
  affirmative: string
  negative: string
  question: string
  sourceSubject: string
  plural: boolean
  canOmitSubject: boolean
}

const persons: Record<FinnishIdentityPerson, PersonRealization> = {
  '1sg': {
    pronoun: 'minä',
    affirmative: 'olen',
    negative: 'en',
    question: 'olenko',
    sourceSubject: 'Я',
    plural: false,
    canOmitSubject: true,
  },
  '2sg': {
    pronoun: 'sinä',
    affirmative: 'olet',
    negative: 'et',
    question: 'oletko',
    sourceSubject: 'Ты',
    plural: false,
    canOmitSubject: true,
  },
  '3sg': {
    pronoun: 'hän',
    affirmative: 'on',
    negative: 'ei',
    question: 'onko',
    sourceSubject: 'Он',
    plural: false,
    canOmitSubject: false,
  },
  '1pl': {
    pronoun: 'me',
    affirmative: 'olemme',
    negative: 'emme',
    question: 'olemmeko',
    sourceSubject: 'Мы',
    plural: true,
    canOmitSubject: true,
  },
  '2pl': {
    pronoun: 'te',
    affirmative: 'olette',
    negative: 'ette',
    question: 'oletteko',
    sourceSubject: 'Вы',
    plural: true,
    canOmitSubject: true,
  },
  '3pl': {
    pronoun: 'he',
    affirmative: 'ovat',
    negative: 'eivät',
    question: 'ovatko',
    sourceSubject: 'Они',
    plural: true,
    canOmitSubject: false,
  },
}

export function realizeFinnishIdentity(
  definition: FinnishIdentityTemplateDefinition,
  parameters: FinnishIdentityParameters,
): FinnishGeneratedIdentityExercise {
  validateFinnishIdentityTemplate(definition)
  if (!definition.personKeys.includes(parameters.person)) {
    throw new Error(`Person ${parameters.person} is not enabled by template`)
  }

  const person = persons[parameters.person]
  const complement = definition.complements.find(
    (item) => item.key === parameters.complementKey,
  )
  if (!complement) {
    throw new Error(`Unknown identity complement ${parameters.complementKey}`)
  }

  const targetComplement = person.plural
    ? complement.plural
    : complement.singular
  const sourceComplement = person.plural
    ? complement.sourcePlural
    : complement.sourceSingular
  const grammarItemId = definition.grammarItems[parameters.category]

  if (parameters.category === 'affirmative') {
    const targetText = `${capitalize(person.pronoun)} ${person.affirmative} ${targetComplement}.`
    return {
      parameters,
      prompt: `Переведи на финский: ${person.sourceSubject} ${sourceComplement}.`,
      targetText,
      acceptedVariants: [
        targetText,
        ...(person.canOmitSubject
          ? [`${capitalize(person.affirmative)} ${targetComplement}.`]
          : []),
      ],
      slots: attachItems(
        [
          {
            role: 'subject',
            accepted: [person.pronoun],
            optional: person.canOmitSubject,
          },
          { role: 'mainVerb', accepted: [person.affirmative] },
          { role: 'complement', accepted: [targetComplement] },
        ],
        grammarItemId,
        complement.itemId,
      ),
      grammarItemId,
      vocabularyItemId: complement.itemId,
    }
  }

  if (parameters.category === 'negative') {
    const targetText = `${capitalize(person.pronoun)} ${person.negative} ole ${targetComplement}.`
    return {
      parameters,
      prompt: `Переведи на финский: ${person.sourceSubject} не ${sourceComplement}.`,
      targetText,
      acceptedVariants: [
        targetText,
        ...(person.canOmitSubject
          ? [`${capitalize(person.negative)} ole ${targetComplement}.`]
          : []),
      ],
      slots: attachItems(
        [
          {
            role: 'subject',
            accepted: [person.pronoun],
            optional: person.canOmitSubject,
          },
          { role: 'negativeVerb', accepted: [person.negative] },
          { role: 'mainVerb', accepted: ['ole'] },
          { role: 'complement', accepted: [targetComplement] },
        ],
        grammarItemId,
        complement.itemId,
      ),
      grammarItemId,
      vocabularyItemId: complement.itemId,
    }
  }

  const targetText = `${capitalize(person.question)} ${person.pronoun} ${targetComplement}?`
  return {
    parameters,
    prompt: `Переведи на финский: ${person.sourceSubject} ${sourceComplement}?`,
    targetText,
    acceptedVariants: [
      targetText,
      ...(person.canOmitSubject
        ? [`${capitalize(person.question)} ${targetComplement}?`]
        : []),
    ],
    slots: attachItems(
      [
        { role: 'questionVerb', accepted: [person.question] },
        {
          role: 'subject',
          accepted: [person.pronoun],
          optional: person.canOmitSubject,
        },
        { role: 'complement', accepted: [targetComplement] },
      ],
      grammarItemId,
      complement.itemId,
    ),
    grammarItemId,
    vocabularyItemId: complement.itemId,
  }
}

export function validateFinnishIdentityTemplate(
  value: unknown,
): asserts value is FinnishIdentityTemplateDefinition {
  if (!isRecord(value)) {
    throw new Error('Finnish identity template must be an object')
  }
  if (
    value.schemaVersion !== 1 ||
    value.frame !== 'identity' ||
    value.sourceLanguage !== 'ru' ||
    value.targetLanguage !== 'fi'
  ) {
    throw new Error('Unsupported Finnish identity template')
  }
  if (
    typeof value.lessonId !== 'string' ||
    !value.lessonId ||
    !Array.isArray(value.personKeys) ||
    value.personKeys.length === 0
  ) {
    throw new Error('Identity template must declare a lesson and persons')
  }
  if (!value.personKeys.every(isFinnishIdentityPerson)) {
    throw new Error('Identity template contains an unsupported person')
  }
  if (new Set(value.personKeys).size !== value.personKeys.length) {
    throw new Error('Identity template person keys must be unique')
  }
  if (!isRecord(value.grammarItems)) {
    throw new Error('Identity template must declare grammar items')
  }
  for (const category of ['affirmative', 'negative', 'question'] as const) {
    if (
      typeof value.grammarItems[category] !== 'string' ||
      !value.grammarItems[category]
    ) {
      throw new Error(`Identity template is missing ${category} grammar item`)
    }
  }
  if (new Set(Object.values(value.grammarItems)).size !== 3) {
    throw new Error('Identity template grammar items must be unique')
  }
  if (!Array.isArray(value.complements) || value.complements.length === 0) {
    throw new Error('Identity template must declare complements')
  }
  if (!value.complements.every(isRecord)) {
    throw new Error('Identity template complements must be objects')
  }
  if (
    new Set(value.complements.map((item) => item.key)).size !==
    value.complements.length
  ) {
    throw new Error('Identity template complement keys must be unique')
  }
  if (
    new Set(value.complements.map((item) => item.itemId)).size !==
    value.complements.length
  ) {
    throw new Error('Identity template complement items must be unique')
  }
  for (const item of value.complements) {
    if (
      typeof item.key !== 'string' ||
      !item.key ||
      typeof item.itemId !== 'string' ||
      !item.itemId ||
      typeof item.singular !== 'string' ||
      !item.singular ||
      typeof item.plural !== 'string' ||
      !item.plural ||
      typeof item.sourceSingular !== 'string' ||
      !item.sourceSingular ||
      typeof item.sourcePlural !== 'string' ||
      !item.sourcePlural
    ) {
      throw new Error(
        `Identity complement ${String(item.key || 'unknown')} is incomplete`,
      )
    }
  }
}

function isFinnishIdentityPerson(
  value: unknown,
): value is FinnishIdentityPerson {
  return typeof value === 'string' && Object.hasOwn(persons, value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function attachItems(
  slots: Array<{ role: string; accepted: string[]; optional?: boolean }>,
  grammarItemId: string,
  vocabularyItemId: string,
): FinnishGeneratedAnswerSlot[] {
  return slots.map((slot) => ({
    ...slot,
    itemIds: slot.role === 'complement' ? [vocabularyItemId] : [grammarItemId],
  }))
}

function capitalize(value: string): string {
  return `${value.charAt(0).toLocaleUpperCase('fi')}${value.slice(1)}`
}
