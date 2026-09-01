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
}

export interface LessonExplanationTable {
  headers: LocalizedText[]
  rows: LocalizedText[][]
}

export interface LessonExplanationScreen {
  id: string
  title: LocalizedText
  paragraphs: LocalizedText[]
  table?: LessonExplanationTable
  examples?: LessonExplanationExample[]
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

export interface PracticeCorrectionResponse {
  exerciseId: string
  retryAfterAttempt: number
}

export interface PracticeSessionResponse {
  startedAt: string
  totalExercises: number
  requiredCorrectAnswers: number
  correctionDelay: number
  answeredExercises: number
  correctAnswers: number
  attemptIds: string[]
  completedExerciseIds: string[]
  pendingCorrections: PracticeCorrectionResponse[]
}

export interface PracticeCompletionResponse {
  totalExercises: number
  correctAnswers: number
  requiredCorrectAnswers: number
  scorePercent: number
  passed: boolean
  progress: CourseProgressResponse
}

export interface LessonVocabularyStudyProgressResponse {
  itemId: string
  correctAnswers: number
  attempts: number
  completedAt: string | null
}

export interface LessonVocabularyStudySessionResponse {
  lessonId: string
  requiredCorrectAnswers: number
  totalItems: number
  completedItems: number
  totalCorrectAnswers: number
  items: LessonVocabularyStudyProgressResponse[]
}

export interface LessonVocabularyAnswerRequest {
  answer: string
  idempotencyKey: string
  gaveUp?: boolean
}

export interface LessonVocabularyAnswerResponse {
  itemId: string
  isCorrect: boolean
  expectedAnswer: string
  itemProgress: LessonVocabularyStudyProgressResponse
  session: LessonVocabularyStudySessionResponse
}

export type ReviewMemoryState = 'NEW' | 'LEARNING' | 'REVIEW' | 'RELEARNING'
export type VocabularyKnowledgeStatus = 'LEARNING' | 'LEARNED'

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
  introducedIn:
    | {
        kind: 'lesson'
        lessonId: string
        title: LocalizedText
      }
    | {
        kind: 'text'
        textId: string
        title: LocalizedText
      }
  memory: {
    state: ReviewMemoryState
    status: VocabularyKnowledgeStatus
    progressPercent: number
    dueAt: string | null
    isDue: boolean
    repetitions: number
    lapses: number
  }
}

export interface UserGrammarItemResponse {
  itemId: string
  kind: Exclude<KnowledgeItemKind, 'LEXICAL_SENSE'>
  name: LocalizedText
  description: LocalizedText | null
  introducedIn:
    | {
        kind: 'lesson'
        lessonId: string
        title: LocalizedText
      }
    | {
        kind: 'text'
        textId: string
        title: LocalizedText
      }
  memory: {
    state: ReviewMemoryState
    status: VocabularyKnowledgeStatus
    progressPercent: number
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
  counts: {
    all: number
    due: number
    learning: number
    learned: number
  }
  items: UserVocabularyItemResponse[]
  grammarCounts: {
    all: number
    due: number
    learning: number
    learned: number
  }
  grammarItems: UserGrammarItemResponse[]
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
  isGrammarReady: boolean
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

export interface PreparedTextTokenDictionaryResponse {
  gloss: LocalizedText
  partOfSpeech: string
  forms: LessonVocabularyFormResponse[]
}

export interface PreparedTextTokenResponse {
  position: number
  surface: string
  lemma: string
  translation: LocalizedText
  analysis: Record<string, string>
  analyses: FinnishWordAnalysisResponse[]
  charStart: number
  charEnd: number
  dictionary: PreparedTextTokenDictionaryResponse
  lexical: PreparedTextTokenLexicalResponse | null
}

export interface PreparedTextAudioSegmentResponse {
  charStart: number
  charEnd: number
  audioStartMs: number
  audioEndMs: number
}

export interface PreparedTextDetailResponse extends PreparedTextSummaryResponse {
  body: string
  audioSegments: PreparedTextAudioSegmentResponse[]
  tokens: PreparedTextTokenResponse[]
}

export type ExerciseReportReason =
  | 'WRONG_PROMPT'
  | 'WRONG_ANSWER'
  | 'UNNATURAL_LANGUAGE'
  | 'TECHNICAL_PROBLEM'
  | 'OTHER'

export type ExerciseReportStatus = 'NEW' | 'IN_PROGRESS' | 'FIXED' | 'DISMISSED'

export type UserRole = 'USER' | 'ADMIN'

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
  status: ExerciseReportStatus
  createdAt: string
  updatedAt: string
}

export interface AdminExerciseReportResponse extends ExerciseReportResponse {
  reporter: {
    id: string
    name: string
    email: string
  }
  exercise: {
    id: string
    lessonId: string | null
    prompt: string
    expectedAnswer: string
  }
  attempt: {
    id: string
    answerText: string
    outcome: ExerciseAttemptOutcome
    answeredAt: string
  }
}

export interface AdminExerciseReportListResponse {
  filter: ExerciseReportStatus | 'ALL'
  totalCount: number
  counts: Record<ExerciseReportStatus, number>
  items: AdminExerciseReportResponse[]
}

export interface AdminExerciseReportExportResponse {
  exportedAt: string
  filter: ExerciseReportStatus | 'ALL'
  totalCount: number
  items: AdminExerciseReportResponse[]
}

export interface UpdateExerciseReportStatusRequest {
  status: ExerciseReportStatus
}

export interface AccountDataExportResponse {
  exportedAt: string
  user: {
    id: string
    name: string
    email: string
    emailVerified: boolean
    role: UserRole
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
  vocabularyStudyProgress: Array<{
    routeVersionId: string
    lessonId: string
    itemId: string
    correctAnswers: number
    attempts: number
    completedAt: string | null
    lastAnsweredAt: string | null
  }>
  vocabularyStudyAttempts: Array<{
    id: string
    routeVersionId: string
    lessonId: string
    itemId: string
    answerText: string
    isCorrect: boolean
    correctAnswersAfter: number
    answeredAt: string
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
    status: ExerciseReportStatus
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

export type WordMemoryStatus = 'LEARNING' | 'KNOWN'

export interface ChangeWordMemoryStatusRequest {
  status: WordMemoryStatus
}

export interface VocabularyStudyResponse {
  itemId: string
  state: ReviewMemoryState
  dueAt: string
  repetitions: number
  lapses: number
}

export interface PreparedAnswerSlot {
  role: string
  accepted: string[]
  itemIds?: string[]
  optional?: boolean
}

export interface PreparedAnswerSpec {
  acceptedVariants: string[]
  slots: PreparedAnswerSlot[]
}

export interface PreparedExerciseResponse {
  id: string
  lessonId: string
  sourceLanguage: string
  targetLanguage: string
  prompt: string
  audioUrl: string | null
  answerSpec: PreparedAnswerSpec
  checkerVersion: string
}

export interface PreparedReviewExerciseResponse extends PreparedExerciseResponse {
  reviewItemIds: string[]
}

export interface PreparedReviewFlashcardResponse {
  itemId: string
  lemma: string
  gloss: LocalizedText
  example: VocabularyExampleResponse | null
}

export interface NextReviewResponse {
  dueCount: number
  exercise: PreparedReviewExerciseResponse | null
  flashcard: PreparedReviewFlashcardResponse | null
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
