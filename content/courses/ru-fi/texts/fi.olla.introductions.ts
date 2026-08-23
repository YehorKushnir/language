interface TokenReference {
  lemma: string
  lexicalSenseId?: string
  analysis: Record<string, string>
}

interface PreparedTextSeed {
  id: string
  courseId: string
  title: Record<string, string>
  level: string
  topics: string[]
  body: string
  knowledgeItemIds: string[]
  tokens: Array<{
    position: number
    surface: string
    lemma: string
    lexicalSenseId?: string
    analysis: Record<string, string>
    charStart: number
    charEnd: number
  }>
}

const lexicalReferences: Record<string, TokenReference> = {
  opiskelija: {
    lemma: 'opiskelija',
    lexicalSenseId: 'word.fi.opiskelija.person',
    analysis: { partOfSpeech: 'noun', case: 'nominative', number: 'singular' },
  },
  opettaja: {
    lemma: 'opettaja',
    lexicalSenseId: 'word.fi.opettaja.person',
    analysis: { partOfSpeech: 'noun', case: 'nominative', number: 'singular' },
  },
  väsynyt: {
    lemma: 'väsynyt',
    lexicalSenseId: 'word.fi.vasynyt.state',
    analysis: {
      partOfSpeech: 'adjective',
      case: 'nominative',
      number: 'singular',
    },
  },
  valmis: {
    lemma: 'valmis',
    lexicalSenseId: 'word.fi.valmis.state',
    analysis: {
      partOfSpeech: 'adjective',
      case: 'nominative',
      number: 'singular',
    },
  },
  kotona: {
    lemma: 'kotona',
    lexicalSenseId: 'word.fi.kotona.location',
    analysis: { partOfSpeech: 'adverb' },
  },
  täällä: {
    lemma: 'täällä',
    lexicalSenseId: 'word.fi.taalla.location',
    analysis: { partOfSpeech: 'adverb' },
  },
}

const grammarReferences: Record<string, TokenReference> = {
  minä: {
    lemma: 'minä',
    analysis: { partOfSpeech: 'pronoun', person: 'first', number: 'singular' },
  },
  sinä: {
    lemma: 'sinä',
    analysis: { partOfSpeech: 'pronoun', person: 'second', number: 'singular' },
  },
  hän: {
    lemma: 'hän',
    analysis: { partOfSpeech: 'pronoun', person: 'third', number: 'singular' },
  },
  me: {
    lemma: 'me',
    analysis: { partOfSpeech: 'pronoun', person: 'first', number: 'plural' },
  },
  he: {
    lemma: 'he',
    analysis: { partOfSpeech: 'pronoun', person: 'third', number: 'plural' },
  },
  olen: {
    lemma: 'olla',
    analysis: {
      partOfSpeech: 'verb',
      person: 'first',
      number: 'singular',
      polarity: 'affirmative',
    },
  },
  on: {
    lemma: 'olla',
    analysis: {
      partOfSpeech: 'verb',
      person: 'third',
      number: 'singular',
      polarity: 'affirmative',
    },
  },
  olemme: {
    lemma: 'olla',
    analysis: {
      partOfSpeech: 'verb',
      person: 'first',
      number: 'plural',
      polarity: 'affirmative',
    },
  },
  en: {
    lemma: 'ei',
    analysis: {
      partOfSpeech: 'verb',
      person: 'first',
      number: 'singular',
      polarity: 'negative',
    },
  },
  eivät: {
    lemma: 'ei',
    analysis: {
      partOfSpeech: 'verb',
      person: 'third',
      number: 'plural',
      polarity: 'negative',
    },
  },
  oletko: {
    lemma: 'olla',
    analysis: {
      partOfSpeech: 'verb',
      person: 'second',
      number: 'singular',
      mood: 'question',
    },
  },
  ole: {
    lemma: 'olla',
    analysis: { partOfSpeech: 'verb', form: 'connegative' },
  },
  mutta: { lemma: 'mutta', analysis: { partOfSpeech: 'conjunction' } },
}

const namedReferences: Record<string, TokenReference> = {
  anna: { lemma: 'Anna', analysis: { partOfSpeech: 'properNoun' } },
  mika: { lemma: 'Mika', analysis: { partOfSpeech: 'properNoun' } },
}

const tokenReferences = {
  ...lexicalReferences,
  ...grammarReferences,
  ...namedReferences,
}

function tokenize(body: string): PreparedTextSeed['tokens'] {
  return [...body.matchAll(/[\p{L}\p{M}]+/gu)].map((match, position) => {
    const surface = match[0]
    const charStart = match.index
    const reference = tokenReferences[surface.toLocaleLowerCase('fi')]

    return {
      position,
      surface,
      lemma: reference?.lemma ?? surface.toLocaleLowerCase('fi'),
      lexicalSenseId: reference?.lexicalSenseId,
      analysis: reference?.analysis ?? { partOfSpeech: 'unknown' },
      charStart,
      charEnd: charStart + surface.length,
    }
  })
}

function createText(
  definition: Omit<PreparedTextSeed, 'courseId' | 'tokens'>,
): PreparedTextSeed {
  return {
    ...definition,
    courseId: 'course.ru-fi',
    tokens: tokenize(definition.body),
  }
}

export const preparedTexts: PreparedTextSeed[] = [
  createText({
    id: 'text.fi.olla.meeting',
    title: { ru: 'Знакомство в университете' },
    level: 'A1',
    topics: ['знакомство', 'учёба'],
    body: 'Minä olen Anna. Olen opiskelija. Hän on Mika. Hän on opettaja. Me olemme täällä.',
    knowledgeItemIds: [
      'grammar.fi.olla.affirmative',
      'word.fi.opiskelija.person',
      'word.fi.opettaja.person',
      'word.fi.taalla.location',
    ],
  }),
  createText({
    id: 'text.fi.olla.ready',
    title: { ru: 'Мы готовы?' },
    level: 'A1',
    topics: ['состояние', 'дом'],
    body: 'Minä en ole väsynyt. Oletko sinä valmis? Me olemme kotona, mutta he eivät ole täällä.',
    knowledgeItemIds: [
      'grammar.fi.olla.affirmative',
      'grammar.fi.olla.negative',
      'grammar.fi.olla.question',
      'word.fi.vasynyt.state',
      'word.fi.valmis.state',
      'word.fi.kotona.location',
      'word.fi.taalla.location',
    ],
  }),
]
