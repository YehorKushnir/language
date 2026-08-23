export type FinnishPartOfSpeech =
  | 'abbreviation'
  | 'adjective'
  | 'adposition'
  | 'adverb'
  | 'conjunction'
  | 'interjection'
  | 'negativeVerb'
  | 'noun'
  | 'numeral'
  | 'prefix'
  | 'pronoun'
  | 'properNoun'
  | 'unknown'
  | 'verb'

export type FinnishGrammaticalCase =
  | 'abessive'
  | 'ablative'
  | 'accusative'
  | 'adessive'
  | 'allative'
  | 'comitative'
  | 'elative'
  | 'essive'
  | 'genitive'
  | 'illative'
  | 'inessive'
  | 'instructive'
  | 'nominative'
  | 'partitive'
  | 'translative'
  | 'unknown'

export type FinnishGrammaticalNumber = 'singular' | 'plural' | 'unknown'
export type FinnishGrammaticalPerson =
  'first' | 'second' | 'third' | 'passive' | 'unknown'

export interface FinnishMorphologicalFeatures {
  case?: FinnishGrammaticalCase
  comparison?: string
  connegative?: 'false' | 'true' | 'both'
  focus?: string
  mood?: string
  number?: FinnishGrammaticalNumber
  participle?: string
  person?: FinnishGrammaticalPerson
  possessive?: string
  questionClitic?: boolean
  register?: 'spoken' | 'standard'
  tense?: string
}

export type FinnishMorphologyOverrides = Record<string, FinnishWordAnalysis[]>

export interface FinnishWordAnalysis {
  lemma: string
  partOfSpeech: FinnishPartOfSpeech
  features: FinnishMorphologicalFeatures
  structure?: string
  wordBases?: string
  raw: Record<string, string>
}

export type FinnishTokenType = 'word' | 'punctuation' | 'whitespace' | 'unknown'

export interface FinnishTextToken {
  type: FinnishTokenType
  surface: string
  charStart: number
  charEnd: number
  analyses: FinnishWordAnalysis[]
}

export interface FinnishSpellingResult {
  word: string
  isCorrect: boolean
  suggestions: string[]
}

export interface FinnishGrammarError {
  code: number
  charStart: number
  charEnd: number
  suggestions: string[]
  description: string
}

export interface FinnishSentence {
  text: string
  charStart: number
  charEnd: number
  nextStart: 'none' | 'noStart' | 'probable' | 'possible'
}

export interface FinnishMorphologyEngineInfo {
  engine: 'voikko-wasm'
  adapterVersion: 1
  dictionaryLanguage: 'fi'
  capabilities: Array<
    | 'analysis'
    | 'grammar'
    | 'hyphenation'
    | 'sentences'
    | 'spelling'
    | 'tokenization'
  >
  ready: true
}

export type FinnishFormRelation =
  'sameForm' | 'sameLemma' | 'spellingError' | 'differentLemma' | 'unknown'

export interface FinnishMorphologicalDifference {
  feature: keyof FinnishMorphologicalFeatures | 'partOfSpeech'
  actual?: string | boolean
  expected?: string | boolean
}

export interface FinnishFormComparison {
  relation: FinnishFormRelation
  actual: string
  expected: string
  actualAnalysis?: FinnishWordAnalysis
  expectedAnalysis?: FinnishWordAnalysis
  differences: FinnishMorphologicalDifference[]
  suggestions: string[]
}

export interface FinnishMorphologyAnalyzer {
  getInfo(): Promise<FinnishMorphologyEngineInfo>
  analyzeWord(word: string): Promise<FinnishWordAnalysis[]>
  analyzeText(text: string): Promise<FinnishTextToken[]>
  compareForms(
    actual: string,
    expected: string[],
  ): Promise<FinnishFormComparison>
  checkSpelling(word: string): Promise<FinnishSpellingResult>
  checkGrammar(text: string): Promise<FinnishGrammarError[]>
  splitSentences(text: string): Promise<FinnishSentence[]>
  hyphenate(word: string): Promise<string>
  close(): void
}

export class FinnishMorphologyInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FinnishMorphologyInputError'
  }
}
