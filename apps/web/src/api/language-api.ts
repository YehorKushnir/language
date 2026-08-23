import type {
  AccountDataExportResponse,
  CourseOverviewResponse,
  CourseProgressResponse,
  ExerciseAttemptRequest,
  ExerciseAttemptResponse,
  LessonDetailResponse,
  LessonPart,
  LessonVocabularyResponse,
  NextReviewResponse,
  PracticeCompletionRequest,
  PracticeCompletionResponse,
  PreparedExerciseResponse,
  PreparedTextCatalogResponse,
  PreparedTextDetailResponse,
  ReviewQueueResponse,
  UserVocabularyResponse,
  VocabularyStudyRequest,
  VocabularyStudyResponse,
} from '@language/contracts'

import { getApiUrl } from '@/lib/api-url'

const apiUrl = getApiUrl(import.meta.env.VITE_API_URL)

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string | string[]
    } | null
    const message = Array.isArray(payload?.message)
      ? payload.message.join(', ')
      : payload?.message

    throw new ApiError(
      message || 'Не удалось выполнить запрос',
      response.status,
    )
  }

  if (response.status === 204) return undefined as T

  return response.json() as Promise<T>
}

export function getCourse(courseId = 'course.ru-fi') {
  return request<CourseOverviewResponse>(`/courses/${courseId}`)
}

export function getLesson(lessonId: string) {
  return request<LessonDetailResponse>(`/lessons/${lessonId}`)
}

export function getLessonVocabulary(lessonId: string) {
  return request<LessonVocabularyResponse>(`/lessons/${lessonId}/vocabulary`)
}

export function getNextExercise(
  lessonId: string,
  sourceLanguage = 'ru',
  excludedExerciseIds: string[] = [],
) {
  const search = new URLSearchParams({ sourceLanguage })
  if (excludedExerciseIds.length > 0) {
    search.set('exclude', excludedExerciseIds.join(','))
  }
  return request<PreparedExerciseResponse>(
    `/lessons/${lessonId}/exercises/next?${search.toString()}`,
  )
}

export function submitExerciseAttempt(
  exerciseId: string,
  attempt: ExerciseAttemptRequest,
) {
  return request<ExerciseAttemptResponse>(`/exercises/${exerciseId}/attempts`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(attempt),
  })
}

export function getCourseProgress(routeVersionId: string) {
  return request<CourseProgressResponse>(
    `/me/course-progress/${routeVersionId}`,
  )
}

export function getReviewQueue(routeVersionId: string) {
  return request<ReviewQueueResponse>(`/me/reviews/${routeVersionId}`)
}

export function getUserVocabulary(routeVersionId: string) {
  return request<UserVocabularyResponse>(`/me/vocabulary/${routeVersionId}`)
}

export function addVocabularyItem(routeVersionId: string, itemId: string) {
  return request<VocabularyStudyResponse>(
    `/me/vocabulary/${routeVersionId}/${itemId}`,
    { method: 'PUT' },
  )
}

export function getPreparedTexts(routeVersionId: string) {
  return request<PreparedTextCatalogResponse>(`/me/texts/${routeVersionId}`)
}

export function getPreparedText(routeVersionId: string, textId: string) {
  return request<PreparedTextDetailResponse>(
    `/me/texts/${routeVersionId}/${textId}`,
  )
}

export function exportAccountData() {
  return request<AccountDataExportResponse>('/me/data-export')
}

export function deleteAccount() {
  return request<void>('/me', {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ confirmation: 'УДАЛИТЬ' }),
  })
}

export function getNextReview(
  routeVersionId: string,
  sourceLanguage = 'ru',
  excludedExerciseIds: string[] = [],
) {
  const search = new URLSearchParams({ sourceLanguage })
  if (excludedExerciseIds.length > 0) {
    search.set('exclude', excludedExerciseIds.join(','))
  }

  return request<NextReviewResponse>(
    `/me/reviews/${routeVersionId}/next?${search.toString()}`,
  )
}

export function completeLessonPart(
  routeVersionId: string,
  lessonId: string,
  part: LessonPart,
) {
  return request<CourseProgressResponse>(
    `/me/course-progress/${routeVersionId}/lessons/${lessonId}/parts/${part}`,
    { method: 'PUT' },
  )
}

export function completePractice(
  routeVersionId: string,
  lessonId: string,
  completion: PracticeCompletionRequest,
) {
  return request<PracticeCompletionResponse>(
    `/me/course-progress/${routeVersionId}/lessons/${lessonId}/practice-completion`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(completion),
    },
  )
}

export function studyVocabularyItem(
  routeVersionId: string,
  lessonId: string,
  itemId: string,
  study: VocabularyStudyRequest,
) {
  return request<VocabularyStudyResponse>(
    `/me/course-progress/${routeVersionId}/lessons/${lessonId}/vocabulary/${itemId}`,
    {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(study),
    },
  )
}
