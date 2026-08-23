import type {
  FinnishGrammarError,
  FinnishFormComparison,
  FinnishMorphologicalDifference,
  FinnishGrammaticalCase,
  FinnishGrammaticalNumber,
  FinnishGrammaticalPerson,
  FinnishMorphologicalFeatures,
  FinnishMorphologyAnalyzer,
  FinnishMorphologyEngineInfo,
  FinnishMorphologyOverrides,
  FinnishPartOfSpeech,
  FinnishSentence,
  FinnishSpellingResult,
  FinnishTextToken,
  FinnishTokenType,
  FinnishWordAnalysis,
} from './types.js'
import { FinnishMorphologyInputError } from './types.js'

const MAX_WORD_LENGTH = 160
const MAX_TEXT_LENGTH = 20_000
const VOIKKO_MODULE = '@yongsk0066/voikko'

interface VoikkoAnalysis {
  BASEFORM?: string
  CLASS?: string
  COMPARISON?: string
  FOCUS?: string
  KYSYMYSLIITE?: string
  MOOD?: string
  NEGATIVE?: string
  NUMBER?: string
  PARTICIPLE?: string
  PERSON?: string
  POSSESSIVE?: string
  SIJAMUOTO?: string
  STRUCTURE?: string
  TENSE?: string
  WORDBASES?: string
  [key: string]: string | undefined
}

interface VoikkoEngine {
  analyze(word: string): VoikkoAnalysis[]
  check?: never
  close?: never
  grammarErrors(text: string): Array<{
    errorCode: number
    startPos: number
    errorLen: number
    suggestions: string[]
    shortDescription: string
  }>
  hyphenate(word: string): string
  sentences(text: string): Array<{
    text: string
    nextStartType: string
  }>
  setAcceptExtraHyphens(value: boolean): void
  setAcceptMissingHyphens(value: boolean): void
  setIgnoreDot(value: boolean): void
  setIgnoreNonwords(value: boolean): void
  setIgnoreNumbers(value: boolean): void
  setIgnoreUppercase(value: boolean): void
  setSuggestionStrategy(strategy: 'TYPO' | 'OCR'): void
  spell(word: string): boolean
  suggest(word: string): string[]
  terminate(): void
  tokens(text: string): Array<{ type: string; text: string }>
}

interface VoikkoConstructor {
  init(): Promise<VoikkoEngine>
}

const partOfSpeechMap: Record<string, FinnishPartOfSpeech> = {
  asemosana: 'pronoun',
  etuliite: 'prefix',
  etunimi: 'properNoun',
  huudahdussana: 'interjection',
  kieltosana: 'negativeVerb',
  laatusana: 'adjective',
  lukusana: 'numeral',
  lyhenne: 'abbreviation',
  nimi: 'properNoun',
  nimisana: 'noun',
  paikannimi: 'properNoun',
  seikkasana: 'adverb',
  sidesana: 'conjunction',
  suhdesana: 'adposition',
  sukunimi: 'properNoun',
  teonsana: 'verb',
}

const caseMap: Record<string, FinnishGrammaticalCase> = {
  keinonto: 'instructive',
  kohdanto: 'accusative',
  nimento: 'nominative',
  olento: 'essive',
  omanto: 'genitive',
  osanto: 'partitive',
  seuranto: 'comitative',
  sisaeronto: 'elative',
  sisaolento: 'inessive',
  sisatulento: 'illative',
  tulento: 'translative',
  ulkoeronto: 'ablative',
  ulkoolento: 'adessive',
  ulkotulento: 'allative',
  vajanto: 'abessive',
}

const numberMap: Record<string, FinnishGrammaticalNumber> = {
  plural: 'plural',
  singular: 'singular',
}

const personMap: Record<string, FinnishGrammaticalPerson> = {
  '1': 'first',
  '2': 'second',
  '3': 'third',
  '4': 'passive',
}

const tokenTypeMap: Record<string, FinnishTokenType> = {
  PUNCTUATION: 'punctuation',
  UNKNOWN: 'unknown',
  WHITESPACE: 'whitespace',
  WORD: 'word',
}

const sentenceStartMap: Record<string, FinnishSentence['nextStart']> = {
  NONE: 'none',
  NO_START: 'noStart',
  POSSIBLE: 'possible',
  PROBABLE: 'probable',
}

const defaultOverrides: FinnishMorphologyOverrides = {
  mä: [
    createSpokenOverride('minä', 'pronoun', 'minä', {
      case: 'nominative',
      number: 'singular',
      person: 'first',
    }),
  ],
  sä: [
    createSpokenOverride('sinä', 'pronoun', 'sinä', {
      case: 'nominative',
      number: 'singular',
      person: 'second',
    }),
  ],
  oon: [
    createSpokenOverride('olla', 'verb', 'olen', {
      mood: 'indicative',
      number: 'singular',
      person: 'first',
      tense: 'present_simple',
    }),
  ],
  oot: [
    createSpokenOverride('olla', 'verb', 'olet', {
      mood: 'indicative',
      number: 'singular',
      person: 'second',
      tense: 'present_simple',
    }),
  ],
}

export class VoikkoFinnishMorphologyAnalyzer implements FinnishMorphologyAnalyzer {
  private closed = false

  private constructor(
    private readonly voikko: VoikkoEngine,
    private readonly overrides: FinnishMorphologyOverrides,
  ) {}

  static async create(
    overrides: FinnishMorphologyOverrides = defaultOverrides,
  ): Promise<VoikkoFinnishMorphologyAnalyzer> {
    const voikko = await initializeVoikko()
    voikko.setSuggestionStrategy('TYPO')
    voikko.setIgnoreDot(false)
    voikko.setIgnoreNumbers(false)
    voikko.setIgnoreUppercase(false)
    voikko.setIgnoreNonwords(false)
    voikko.setAcceptExtraHyphens(false)
    voikko.setAcceptMissingHyphens(false)
    return new VoikkoFinnishMorphologyAnalyzer(
      voikko,
      normalizeOverrides(overrides),
    )
  }

  async getInfo(): Promise<FinnishMorphologyEngineInfo> {
    this.ensureOpen()
    return {
      engine: 'voikko-wasm',
      adapterVersion: 1,
      dictionaryLanguage: 'fi',
      capabilities: [
        'analysis',
        'spelling',
        'grammar',
        'tokenization',
        'sentences',
        'hyphenation',
      ],
      ready: true,
    }
  }

  async analyzeWord(word: string): Promise<FinnishWordAnalysis[]> {
    this.ensureOpen()
    const normalized = normalizeWord(word)
    return [
      ...this.getOverrides(normalized),
      ...this.voikko
        .analyze(normalized)
        .map((analysis) => toWordAnalysis(analysis, normalized)),
    ]
  }

  async analyzeText(text: string): Promise<FinnishTextToken[]> {
    this.ensureOpen()
    const normalized = normalizeText(text)
    let cursor = 0

    return this.voikko.tokens(normalized).flatMap((token) => {
      if (token.type === 'NONE') return []
      const charStart = normalized.indexOf(token.text, cursor)
      if (charStart < cursor) {
        throw new Error('Voikko tokenizer returned a token outside the text')
      }
      const charEnd = charStart + token.text.length
      cursor = charEnd

      return [
        {
          type: tokenTypeMap[token.type] ?? 'unknown',
          surface: token.text,
          charStart,
          charEnd,
          analyses:
            token.type === 'WORD'
              ? [
                  ...this.getOverrides(token.text),
                  ...this.voikko
                    .analyze(token.text)
                    .map((analysis) => toWordAnalysis(analysis, token.text)),
                ]
              : [],
        },
      ]
    })
  }

  async compareForms(
    actual: string,
    expected: string[],
  ): Promise<FinnishFormComparison> {
    this.ensureOpen()
    const normalizedActual = normalizeWord(actual).toLocaleLowerCase('fi')
    if (expected.length === 0) {
      throw new FinnishMorphologyInputError(
        'At least one expected form is required',
      )
    }
    const normalizedExpected = [
      ...new Set(
        expected.map((form) => normalizeWord(form).toLocaleLowerCase('fi')),
      ),
    ]
    const exact = normalizedExpected.find((form) => form === normalizedActual)
    if (exact) {
      return {
        relation: 'sameForm',
        actual: normalizedActual,
        expected: exact,
        differences: [],
        suggestions: [],
      }
    }

    const actualAnalyses = await this.analyzeWord(normalizedActual)
    const expectedAnalyses = await Promise.all(
      normalizedExpected.map(async (form) => ({
        form,
        analyses: await this.analyzeWord(form),
      })),
    )
    const sameLemmaCandidates = expectedAnalyses.flatMap(({ form, analyses }) =>
      actualAnalyses.flatMap((actualAnalysis) =>
        analyses.flatMap((expectedAnalysis) =>
          actualAnalysis.lemma.toLocaleLowerCase('fi') ===
          expectedAnalysis.lemma.toLocaleLowerCase('fi')
            ? [
                {
                  form,
                  actualAnalysis,
                  expectedAnalysis,
                  differences: compareMorphologicalFeatures(
                    actualAnalysis,
                    expectedAnalysis,
                  ),
                },
              ]
            : [],
        ),
      ),
    )
    const closest = sameLemmaCandidates.sort(
      (left, right) => left.differences.length - right.differences.length,
    )[0]
    if (closest) {
      return {
        relation: 'sameLemma',
        actual: normalizedActual,
        expected: closest.form,
        actualAnalysis: closest.actualAnalysis,
        expectedAnalysis: closest.expectedAnalysis,
        differences: closest.differences,
        suggestions: [],
      }
    }

    const spelling = await this.checkSpelling(normalizedActual)
    const matchingSuggestion = spelling.suggestions.find((suggestion) =>
      normalizedExpected.includes(suggestion.toLocaleLowerCase('fi')),
    )
    if (!spelling.isCorrect && matchingSuggestion) {
      return {
        relation: 'spellingError',
        actual: normalizedActual,
        expected: matchingSuggestion.toLocaleLowerCase('fi'),
        differences: [],
        suggestions: spelling.suggestions,
      }
    }

    const firstExpected = expectedAnalyses.find(
      ({ analyses }) => analyses.length > 0,
    )
    if (actualAnalyses[0] && firstExpected?.analyses[0]) {
      return {
        relation: 'differentLemma',
        actual: normalizedActual,
        expected: firstExpected.form,
        actualAnalysis: actualAnalyses[0],
        expectedAnalysis: firstExpected.analyses[0],
        differences: [],
        suggestions: spelling.suggestions,
      }
    }

    return {
      relation: 'unknown',
      actual: normalizedActual,
      expected: normalizedExpected[0]!,
      actualAnalysis: actualAnalyses[0],
      expectedAnalysis: firstExpected?.analyses[0],
      differences: [],
      suggestions: spelling.suggestions,
    }
  }

  async checkSpelling(word: string): Promise<FinnishSpellingResult> {
    this.ensureOpen()
    const normalized = normalizeWord(word)
    const isCorrect =
      this.getOverrides(normalized).length > 0 || this.voikko.spell(normalized)
    return {
      word: normalized,
      isCorrect,
      suggestions: isCorrect ? [] : this.voikko.suggest(normalized),
    }
  }

  async checkGrammar(text: string): Promise<FinnishGrammarError[]> {
    this.ensureOpen()
    const normalized = normalizeText(text)
    return this.voikko.grammarErrors(normalized).map((error) => ({
      code: error.errorCode,
      charStart: error.startPos,
      charEnd: error.startPos + error.errorLen,
      suggestions: error.suggestions,
      description: error.shortDescription,
    }))
  }

  async splitSentences(text: string): Promise<FinnishSentence[]> {
    this.ensureOpen()
    const normalized = normalizeText(text)
    let cursor = 0
    return this.voikko.sentences(normalized).map((sentence) => {
      const charStart = normalized.indexOf(sentence.text, cursor)
      if (charStart < cursor) {
        throw new Error('Voikko returned a sentence outside the text')
      }
      const charEnd = charStart + sentence.text.length
      cursor = charEnd
      return {
        text: sentence.text,
        charStart,
        charEnd,
        nextStart: sentenceStartMap[sentence.nextStartType] ?? 'none',
      }
    })
  }

  async hyphenate(word: string): Promise<string> {
    this.ensureOpen()
    return this.voikko.hyphenate(normalizeWord(word))
  }

  close(): void {
    if (this.closed) return
    this.voikko.terminate()
    this.closed = true
  }

  private ensureOpen() {
    if (this.closed) throw new Error('Finnish morphology analyzer is closed')
  }

  private getOverrides(surface: string): FinnishWordAnalysis[] {
    return this.overrides[surface.toLocaleLowerCase('fi')] ?? []
  }
}

function normalizeWord(word: string): string {
  const normalized = word.normalize('NFC').trim()
  if (!normalized) throw new FinnishMorphologyInputError('Word is required')
  if (normalized.length > MAX_WORD_LENGTH) {
    throw new FinnishMorphologyInputError(
      `Word must not exceed ${MAX_WORD_LENGTH} characters`,
    )
  }
  if (/\s/u.test(normalized)) {
    throw new FinnishMorphologyInputError('Expected one word without spaces')
  }
  return normalized
}

function normalizeText(text: string): string {
  const normalized = text.normalize('NFC')
  if (!normalized.trim()) {
    throw new FinnishMorphologyInputError('Text is required')
  }
  if (normalized.length > MAX_TEXT_LENGTH) {
    throw new FinnishMorphologyInputError(
      `Text must not exceed ${MAX_TEXT_LENGTH} characters`,
    )
  }
  return normalized
}

function toWordAnalysis(
  analysis: VoikkoAnalysis,
  surface: string,
): FinnishWordAnalysis {
  const raw = Object.fromEntries(
    Object.entries(analysis).flatMap(([key, value]) =>
      value === undefined ? [] : [[key, value]],
    ),
  )
  const features: FinnishMorphologicalFeatures = {}

  if (analysis.SIJAMUOTO) {
    features.case = caseMap[analysis.SIJAMUOTO] ?? 'unknown'
  }
  if (analysis.NUMBER) {
    features.number = numberMap[analysis.NUMBER] ?? 'unknown'
  }
  if (analysis.PERSON) {
    features.person = personMap[analysis.PERSON] ?? 'unknown'
  }
  if (analysis.MOOD) features.mood = analysis.MOOD
  if (analysis.TENSE) features.tense = analysis.TENSE
  if (analysis.NEGATIVE && isConnegative(analysis.NEGATIVE)) {
    features.connegative = analysis.NEGATIVE
  }
  if (analysis.PARTICIPLE) features.participle = analysis.PARTICIPLE
  if (analysis.POSSESSIVE) features.possessive = analysis.POSSESSIVE
  if (analysis.COMPARISON) features.comparison = analysis.COMPARISON
  if (analysis.FOCUS) features.focus = analysis.FOCUS
  if (analysis.KYSYMYSLIITE) {
    features.questionClitic = analysis.KYSYMYSLIITE === 'true'
  }

  return {
    lemma: analysis.BASEFORM ?? surface.toLocaleLowerCase('fi'),
    partOfSpeech: partOfSpeechMap[analysis.CLASS ?? ''] ?? 'unknown',
    features,
    structure: analysis.STRUCTURE,
    wordBases: analysis.WORDBASES,
    raw,
  }
}

function compareMorphologicalFeatures(
  actual: FinnishWordAnalysis,
  expected: FinnishWordAnalysis,
): FinnishMorphologicalDifference[] {
  const differences: FinnishMorphologicalDifference[] = []
  if (actual.partOfSpeech !== expected.partOfSpeech) {
    differences.push({
      feature: 'partOfSpeech',
      actual: actual.partOfSpeech,
      expected: expected.partOfSpeech,
    })
  }

  const featureNames = new Set([
    ...Object.keys(actual.features),
    ...Object.keys(expected.features),
  ] as Array<keyof FinnishMorphologicalFeatures>)
  for (const feature of featureNames) {
    const actualValue = actual.features[feature]
    const expectedValue = expected.features[feature]
    if (actualValue !== expectedValue) {
      differences.push({
        feature,
        actual: actualValue,
        expected: expectedValue,
      })
    }
  }
  return differences
}

function createSpokenOverride(
  lemma: string,
  partOfSpeech: FinnishPartOfSpeech,
  standardForm: string,
  features: FinnishMorphologicalFeatures,
): FinnishWordAnalysis {
  return {
    lemma,
    partOfSpeech,
    features: { ...features, register: 'spoken' },
    raw: { SOURCE: 'pedagogical-override', STANDARD_FORM: standardForm },
  }
}

function normalizeOverrides(
  overrides: FinnishMorphologyOverrides,
): FinnishMorphologyOverrides {
  return Object.fromEntries(
    Object.entries(overrides).map(([surface, analyses]) => [
      surface.normalize('NFC').toLocaleLowerCase('fi'),
      analyses,
    ]),
  )
}

async function initializeVoikko(): Promise<VoikkoEngine> {
  const originalWarning = console.warn
  console.warn = (message?: unknown, ...optionalParameters: unknown[]) => {
    if (
      message ===
      'using deprecated parameters for the initialization function; pass a single object instead'
    ) {
      return
    }
    originalWarning(message, ...optionalParameters)
  }

  try {
    const { Voikko } = (await import(VOIKKO_MODULE)) as {
      Voikko: VoikkoConstructor
    }
    return await Voikko.init()
  } finally {
    console.warn = originalWarning
  }
}

function isConnegative(value: string): value is 'false' | 'true' | 'both' {
  return value === 'false' || value === 'true' || value === 'both'
}
