import type {
  LessonVocabularySeed,
  PreparedExerciseSeed,
} from './fi.olla.basics.js'

export interface CuratedPresentVerb {
  lemma: string
  gloss: string
  forms: [string, string, string, string, string, string]
  connegative: string
  verbType: string
  semanticType: string
}

export function buildPresentVerbVocabulary(input: {
  lessonPosition: number
  keyPrefix: string
  verbs: readonly CuratedPresentVerb[]
}): LessonVocabularySeed[] {
  return input.verbs.map((item, index) => {
    const serial = `${String(input.lessonPosition).padStart(2, '0')}.${String(index + 1).padStart(2, '0')}`
    return {
      key: `${input.keyPrefix}-${item.lemma}`,
      itemId: `word.fi.m1.${serial}`,
      conceptId: `concept.fi.m1.${serial}`,
      lexicalEntryId: `lex.fi.${item.lemma}`,
      lemma: item.lemma,
      partOfSpeech: 'verb',
      gloss: item.gloss,
      example: {
        target: `Minä ${item.forms[0]}.`,
        source: { ru: `Форма minä глагола «${item.gloss}».` },
      },
      semanticTypes: [
        'action',
        item.semanticType,
        `verb-type:${item.verbType}`,
      ],
      singular: item.forms[0],
      plural: item.forms[3],
      sourceSingular: item.gloss,
      sourcePlural: item.gloss,
      forms: [
        lexicalForm(serial, 'infinitive', item.lemma, {
          form: 'infinitive',
          verbType: item.verbType,
        }),
        lexicalForm(serial, 'present-1sg', item.forms[0], {
          mood: 'indicative',
          tense: 'present',
          person: 'first',
          number: 'singular',
        }),
        lexicalForm(serial, 'present-3sg', item.forms[2], {
          mood: 'indicative',
          tense: 'present',
          person: 'third',
          number: 'singular',
        }),
        lexicalForm(serial, 'present-3pl', item.forms[5], {
          mood: 'indicative',
          tense: 'present',
          person: 'third',
          number: 'plural',
        }),
        lexicalForm(serial, 'connegative', item.connegative, {
          mood: 'indicative',
          tense: 'present',
          form: 'connegative',
        }),
      ],
    }
  })
}

export function buildPresentVerbExercises(input: {
  idPrefix: string
  verbs: readonly CuratedPresentVerb[]
  vocabulary: readonly LessonVocabularySeed[]
  skillIdFor: (verb: CuratedPresentVerb) => string
}): PreparedExerciseSeed[] {
  const exercises: PreparedExerciseSeed[] = []

  addGroup(0, 18, 'first', ({ item, skillId, vocabulary }) => ({
    prompt: `Поставь ${item.lemma} («${item.gloss}») в форму minä.`,
    targetText: `Minä ${item.forms[0]}.`,
    acceptedVariants: [
      `Minä ${item.forms[0]}.`,
      `${capitalize(item.forms[0])}.`,
    ],
    slots: [
      skillSlot('subject', ['minä'], skillId, true),
      vocabularySlot('mainVerb', [item.forms[0]], skillId, vocabulary.itemId),
    ],
  }))
  addGroup(18, 10, 'second-now', ({ item, skillId, vocabulary }) => ({
    prompt: `Поставь ${item.lemma} («${item.gloss}») в форму sinä и добавь nyt.`,
    targetText: `Sinä ${item.forms[1]} nyt.`,
    acceptedVariants: [
      `Sinä ${item.forms[1]} nyt.`,
      `${capitalize(item.forms[1])} nyt.`,
    ],
    slots: [
      skillSlot('subject', ['sinä'], skillId, true),
      vocabularySlot('mainVerb', [item.forms[1]], skillId, vocabulary.itemId),
      skillSlot('adverb', ['nyt'], skillId),
    ],
  }))
  addGroup(2, 8, 'third', ({ item, skillId, vocabulary }) => ({
    prompt: `Поставь ${item.lemma} («${item.gloss}») в форму hän.`,
    targetText: `Hän ${item.forms[2]}.`,
    acceptedVariants: [`Hän ${item.forms[2]}.`],
    slots: [
      skillSlot('subject', ['hän'], skillId),
      vocabularySlot('mainVerb', [item.forms[2]], skillId, vocabulary.itemId),
    ],
  }))
  addGroup(10, 8, 'first-plural-now', ({ item, skillId, vocabulary }) => ({
    prompt: `Поставь ${item.lemma} («${item.gloss}») в форму me, начав с nyt.`,
    targetText: `Nyt me ${item.forms[3]}.`,
    acceptedVariants: [`Nyt me ${item.forms[3]}.`, `Nyt ${item.forms[3]}.`],
    slots: [
      skillSlot('adverb', ['nyt'], skillId),
      skillSlot('subject', ['me'], skillId, true),
      vocabularySlot('mainVerb', [item.forms[3]], skillId, vocabulary.itemId),
    ],
  }))
  addGroup(18, 8, 'second-plural', ({ item, skillId, vocabulary }) => ({
    prompt: `Поставь ${item.lemma} («${item.gloss}») в форму te.`,
    targetText: `Te ${item.forms[4]}.`,
    acceptedVariants: [`Te ${item.forms[4]}.`, `${capitalize(item.forms[4])}.`],
    slots: [
      skillSlot('subject', ['te'], skillId, true),
      vocabularySlot('mainVerb', [item.forms[4]], skillId, vocabulary.itemId),
    ],
  }))
  addGroup(0, 8, 'third-plural-now', ({ item, skillId, vocabulary }) => ({
    prompt: `Поставь ${item.lemma} («${item.gloss}») в форму he и добавь nyt.`,
    targetText: `He ${item.forms[5]} nyt.`,
    acceptedVariants: [`He ${item.forms[5]} nyt.`],
    slots: [
      skillSlot('subject', ['he'], skillId),
      vocabularySlot('mainVerb', [item.forms[5]], skillId, vocabulary.itemId),
      skillSlot('adverb', ['nyt'], skillId),
    ],
  }))

  if (exercises.length !== 60) {
    throw new Error(
      `${input.idPrefix} must contain 60 exercises, received ${exercises.length}`,
    )
  }
  return exercises

  function addGroup(
    start: number,
    count: number,
    category: string,
    create: (context: {
      item: CuratedPresentVerb
      vocabulary: LessonVocabularySeed
      skillId: string
    }) => Pick<
      PreparedExerciseSeed,
      'prompt' | 'targetText' | 'acceptedVariants' | 'slots'
    >,
  ) {
    Array.from({ length: count }, (_, offset) => {
      const vocabularyIndex = (start + offset) % input.verbs.length
      const item = input.verbs[vocabularyIndex]!
      const vocabulary = input.vocabulary[vocabularyIndex]!
      const skillId = input.skillIdFor(item)
      const values = create({ item, vocabulary, skillId })
      exercises.push({
        id: `${input.idPrefix}.${category}.${serial(offset)}`,
        selectionOrder: exercises.length + 1,
        ...values,
        primaryItemId: skillId,
        secondaryItemIds: [],
        vocabularyItemId: vocabulary.itemId,
      })
    })
  }
}

function lexicalForm(
  serial: string,
  key: string,
  surface: string,
  features: Record<string, string>,
) {
  return { id: `form.fi.m1.${serial}.${key}`, surface, features }
}

function skillSlot(
  role: string,
  accepted: string[],
  skillId: string,
  optional = false,
) {
  return {
    role,
    accepted,
    itemIds: [skillId],
    ...(optional ? { optional } : {}),
  }
}

function vocabularySlot(
  role: string,
  accepted: string[],
  skillId: string,
  vocabularyItemId: string,
) {
  return { role, accepted, itemIds: [skillId, vocabularyItemId] }
}

function serial(index: number) {
  return String(index + 1).padStart(3, '0')
}

function capitalize(value: string) {
  return `${value.charAt(0).toLocaleUpperCase('fi')}${value.slice(1)}`
}
