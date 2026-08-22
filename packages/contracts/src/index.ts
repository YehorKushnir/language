export interface ApiInfo {
  name: 'Language Learning API'
  version: '1'
}

export interface HealthResponse {
  status: 'ok'
  database: 'ok'
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

export interface LessonExplanationScreen {
  id: string
  eyebrow?: LocalizedText
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
}

export interface LessonVocabularyItemResponse {
  itemId: string
  lexicalEntryId: string
  lemma: string
  partOfSpeech: string
  gloss: LocalizedText
  forms: LessonVocabularyFormResponse[]
  status: ContentStatus
}

export interface LessonVocabularyResponse {
  lessonId: string
  items: LessonVocabularyItemResponse[]
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

export interface ExerciseAttemptDiagnostic {
  code:
    | 'EXACT_MATCH'
    | 'MISSING_TOKEN'
    | 'EXTRA_TOKEN'
    | 'WORD_ORDER'
    | 'WRONG_FORM'
    | 'ANSWER_MISMATCH'
  message: LocalizedText
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
