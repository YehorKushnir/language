export interface ApiInfo {
  name: 'Language Learning API'
  version: '1'
}

export interface HealthResponse {
  status: 'ok'
  database: 'ok'
  morphology: 'ok'
}

export interface FinnishMorphologyEngineResponse {
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

export interface FinnishMorphologicalFeaturesResponse {
  case?: string
  comparison?: string
  connegative?: 'false' | 'true' | 'both'
  focus?: string
  mood?: string
  number?: string
  participle?: string
  person?: string
  possessive?: string
  questionClitic?: boolean
  register?: 'spoken' | 'standard'
  tense?: string
}

export interface FinnishWordAnalysisResponse {
  lemma: string
  partOfSpeech: string
  features: FinnishMorphologicalFeaturesResponse
  structure?: string
  wordBases?: string
  raw: Record<string, string>
}

export interface FinnishAnalyzeWordResponse {
  word: string
  isKnown: boolean
  analyses: FinnishWordAnalysisResponse[]
}

export interface FinnishTextTokenResponse {
  type: 'word' | 'punctuation' | 'whitespace' | 'unknown'
  surface: string
  charStart: number
  charEnd: number
  analyses: FinnishWordAnalysisResponse[]
}

export interface FinnishAnalyzeTextResponse {
  text: string
  tokens: FinnishTextTokenResponse[]
}

export interface FinnishSpellingResponse {
  word: string
  isCorrect: boolean
  suggestions: string[]
}

export interface FinnishGrammarErrorResponse {
  code: number
  charStart: number
  charEnd: number
  suggestions: string[]
  description: string
}

export interface FinnishGrammarResponse {
  text: string
  errors: FinnishGrammarErrorResponse[]
}

export interface FinnishSentenceResponse {
  text: string
  charStart: number
  charEnd: number
  nextStart: 'none' | 'noStart' | 'probable' | 'possible'
}

export interface FinnishSentencesResponse {
  text: string
  sentences: FinnishSentenceResponse[]
}

export interface FinnishHyphenationResponse {
  word: string
  hyphenated: string
}

export type LocalizedText = Record<string, string>

export type ContentStatus =
  'DRAFT' | 'GENERATED' | 'VERIFIED' | 'CURATED' | 'BLOCKED'

export type KnowledgeItemKind =
  'LEXICAL_SENSE' | 'GRAMMAR' | 'SPECIFIC_SKILL' | 'REGISTER'

export type LessonItemRole = 'INTRODUCED' | 'PRACTICED' | 'RECOGNITION'

export type LessonPart = 'explanation' | 'vocabulary' | 'practice'

export interface LessonExplanationExample {
  target: string
  source: LocalizedText
  note?: LocalizedText
}

export interface LessonExplanationTable {
  headers: LocalizedText[]
  rows: LocalizedText[][]
}

export interface LessonExplanationQuickCheck {
  prompt: LocalizedText
  answer: string
  explanation?: LocalizedText
}

export interface LessonExplanationScreen {
  id: string
  eyebrow?: LocalizedText
  title: LocalizedText
  paragraphs: LocalizedText[]
  table?: LessonExplanationTable
  examples?: LessonExplanationExample[]
  quickChecks?: LessonExplanationQuickCheck[]
  callout?: LocalizedText
}

export interface CourseLessonSummary {
  id: string
  modulePosition: number
  lessonPosition: number
  title: LocalizedText
  summary: LocalizedText | null
  status: ContentStatus
  knowledgeItemCount: number
  exerciseCount: number
  prerequisiteLessonIds: string[]
}

export interface CourseOverviewResponse {
  id: string
  sourceLanguage: string
  targetLanguage: string
  title: LocalizedText
  description: LocalizedText | null
  status: ContentStatus
  route: {
    id: string
    version: number
    lessons: CourseLessonSummary[]
  } | null
}

export interface LessonKnowledgeItemResponse {
  id: string
  kind: KnowledgeItemKind
  role: LessonItemRole
  position: number | null
  label: LocalizedText
}

export interface LessonDetailResponse {
  id: string
  courseId: string
  title: LocalizedText
  summary: LocalizedText | null
  content: {
    version: number
    sections: LessonPart[]
    explanationScreens: LessonExplanationScreen[]
  }
  status: ContentStatus
  knowledgeItems: LessonKnowledgeItemResponse[]
  exerciseCount: number
}

export interface LessonProgressResponse {
  lessonId: string
  explanationCompletedAt: string | null
  vocabularyCompletedAt: string | null
  practiceCompletedAt: string | null
  completedAt: string | null
}

export interface CourseProgressResponse {
  routeVersionId: string
  currentLessonId: string | null
  completedLessons: number
  totalLessons: number
  dueReviews: number
  nextReviewAt: string | null
  lessons: LessonProgressResponse[]
}

export interface PracticeCompletionRequest {
  attemptIds: string[]
}

export interface PracticeCompletionResponse {
  totalExercises: number
  correctAnswers: number
  requiredCorrectAnswers: number
  scorePercent: number
  passed: boolean
  progress: CourseProgressResponse
}

export type ReviewMemoryState = 'NEW' | 'LEARNING' | 'REVIEW' | 'RELEARNING'

export interface ReviewQueueItemResponse {
  itemId: string
  kind: KnowledgeItemKind
  label: LocalizedText
  state: ReviewMemoryState
  dueAt: string
  isDue: boolean
  repetitions: number
  lapses: number
}

export interface ReviewQueueResponse {
  routeVersionId: string
  dueCount: number
  totalCount: number
  nextDueAt: string | null
  items: ReviewQueueItemResponse[]
}

export type LexicalFeatureValue = string | number | boolean

export interface LessonVocabularyFormResponse {
  id: string
  surface: string
  features: Record<string, LexicalFeatureValue>
  audioUrl: string | null
}

export interface VocabularyExampleResponse {
  target: string
  source: LocalizedText
}

export interface LessonVocabularyItemResponse {
  itemId: string
  lexicalEntryId: string
  lemma: string
  partOfSpeech: string
  gloss: LocalizedText
  example: VocabularyExampleResponse | null
  forms: LessonVocabularyFormResponse[]
  status: ContentStatus
}

export interface LessonVocabularyResponse {
  lessonId: string
  items: LessonVocabularyItemResponse[]
}

export interface UserVocabularyItemResponse extends LessonVocabularyItemResponse {
  introducedIn: {
    lessonId: string
    title: LocalizedText
  }
  memory: {
    state: ReviewMemoryState
    dueAt: string | null
    isDue: boolean
    repetitions: number
    lapses: number
  }
}

export interface UserVocabularyResponse {
  routeVersionId: string
  totalCount: number
  dueCount: number
  items: UserVocabularyItemResponse[]
}

export interface PreparedTextSummaryResponse {
  id: string
  title: LocalizedText
  level: string
  topics: string[]
  grammarItems: Array<{
    itemId: string
    label: LocalizedText
  }>
  preview: string
  wordCount: number
  linkedWordCount: number
  knownWordCount: number
  knownPercent: number
  audioUrl: string | null
}

export interface PreparedTextCatalogResponse {
  routeVersionId: string
  recommendedTextId: string | null
  items: PreparedTextSummaryResponse[]
}

export interface PreparedTextTokenLexicalResponse {
  itemId: string
  gloss: LocalizedText
  example: VocabularyExampleResponse | null
  partOfSpeech: string
  forms: LessonVocabularyFormResponse[]
  memory: {
    state: ReviewMemoryState
    dueAt: string | null
    repetitions: number
  }
}

export interface PreparedTextTokenResponse {
  position: number
  surface: string
  lemma: string
  analysis: Record<string, string>
  analyses: FinnishWordAnalysisResponse[]
  charStart: number
  charEnd: number
  lexical: PreparedTextTokenLexicalResponse | null
}

export interface PreparedTextDetailResponse extends PreparedTextSummaryResponse {
  body: string
  tokens: PreparedTextTokenResponse[]
}

export type ExerciseReportReason =
  | 'WRONG_PROMPT'
  | 'WRONG_ANSWER'
  | 'UNNATURAL_LANGUAGE'
  | 'TECHNICAL_PROBLEM'
  | 'OTHER'

export interface ExerciseReportRequest {
  attemptId: string
  reason: ExerciseReportReason
  comment?: string
}

export interface ExerciseReportResponse {
  id: string
  exerciseId: string
  attemptId: string
  reason: ExerciseReportReason
  comment: string | null
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED'
  createdAt: string
  updatedAt: string
}

export interface AccountDataExportResponse {
  exportedAt: string
  user: {
    id: string
    name: string
    email: string
    emailVerified: boolean
    createdAt: string
  }
  courseProgress: Array<{
    routeVersionId: string
    currentLessonId: string | null
    startedAt: string
    lastActivityAt: string
    completedAt: string | null
  }>
  lessonProgress: Array<{
    routeVersionId: string
    lessonId: string
    explanationCompletedAt: string | null
    vocabularyCompletedAt: string | null
    practiceCompletedAt: string | null
    completedAt: string | null
  }>
  memories: Array<{
    itemId: string
    state: ReviewMemoryState
    dueAt: string
    lastReviewAt: string | null
    repetitions: number
    lapses: number
  }>
  attempts: Array<{
    id: string
    exerciseId: string
    routeVersionId: string
    answerText: string
    outcome: ExerciseAttemptOutcome
    answeredAt: string
    evidence: ExerciseAttemptEvidenceResponse[]
  }>
  exerciseReports: Array<{
    id: string
    exerciseId: string
    attemptId: string
    reason: ExerciseReportReason
    comment: string | null
    status: 'OPEN' | 'RESOLVED' | 'DISMISSED'
    createdAt: string
    updatedAt: string
  }>
}

export interface DeleteAccountRequest {
  confirmation: 'УДАЛИТЬ'
}

export type VocabularyStudyResult = 'SUCCESS' | 'FAILURE'

export interface VocabularyStudyRequest {
  result: VocabularyStudyResult
}

export interface VocabularyStudyResponse {
  itemId: string
  state: ReviewMemoryState
  dueAt: string
  repetitions: number
  lapses: number
}

export interface PreparedExerciseResponse {
  id: string
  lessonId: string
  sourceLanguage: string
  targetLanguage: string
  prompt: string
}

export interface PreparedReviewExerciseResponse extends PreparedExerciseResponse {
  reviewItemIds: string[]
}

export interface NextReviewResponse {
  dueCount: number
  exercise: PreparedReviewExerciseResponse | null
}

export interface ExerciseAttemptRequest {
  answer: string
  idempotencyKey: string
  routeVersionId: string
  durationMs?: number
}

export type ExerciseAttemptOutcome = 'CORRECT' | 'PARTIAL' | 'INCORRECT'

export type AttemptEvidenceResult = 'SUCCESS' | 'FAILURE' | 'IGNORED'

export interface ExerciseAttemptMorphologyDifference {
  feature: string
  actual?: string | boolean
  expected?: string | boolean
}

export interface ExerciseAttemptMorphologyDiagnostic {
  relation: 'sameLemma' | 'spellingError' | 'differentLemma' | 'unknown'
  actualLemma?: string
  expectedLemma?: string
  differences: ExerciseAttemptMorphologyDifference[]
  suggestions: string[]
}

export interface ExerciseAttemptDiagnostic {
  code:
    | 'EXACT_MATCH'
    | 'MISSING_TOKEN'
    | 'EXTRA_TOKEN'
    | 'WORD_ORDER'
    | 'TYPO'
    | 'WRONG_FORM'
    | 'WRONG_LEMMA'
    | 'ANSWER_MISMATCH'
  message: LocalizedText
  morphology?: ExerciseAttemptMorphologyDiagnostic
}

export interface ExerciseAttemptEvidenceResponse {
  itemId: string
  role: 'PRIMARY' | 'SECONDARY' | 'CONTEXT'
  result: AttemptEvidenceResult
}

export interface ExerciseAttemptResponse {
  attemptId: string
  exerciseId: string
  outcome: ExerciseAttemptOutcome
  isCorrect: boolean
  normalizedAnswer: string
  diagnostics: ExerciseAttemptDiagnostic[]
  evidence: ExerciseAttemptEvidenceResponse[]
}
