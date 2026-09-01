import type {
  AccountAuthMethodsResponse,
  AccountDataExportResponse,
  AdminExerciseReportExportResponse,
  AdminExerciseReportListResponse,
  AdminExerciseReportResponse,
  CourseOverviewResponse,
  CourseProgressResponse,
  ExerciseAttemptRequest,
  ExerciseAttemptResponse,
  ExerciseReportRequest,
  ExerciseReportResponse,
  ExerciseReportStatus,
  LessonVocabularyAnswerRequest,
  LessonVocabularyAnswerResponse,
  LessonDetailResponse,
  LessonPart,
  LessonVocabularyStudySessionResponse,
  LessonVocabularyResponse,
  NextReviewResponse,
  PracticeCompletionResponse,
  PracticeSessionResponse,
  PreparedExerciseResponse,
  PreparedTextCatalogResponse,
  PreparedTextDetailResponse,
  SetAccountPasswordRequest,
  UserVocabularyResponse,
  UpdateExerciseReportStatusRequest,
  WordMemoryStatus,
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
  routeVersionId: string,
  sourceLanguage = 'ru',
  excludedExerciseIds: string[] = [],
) {
  const search = new URLSearchParams({ sourceLanguage, routeVersionId })
  if (excludedExerciseIds.length > 0) {
    search.set('exclude', excludedExerciseIds.join(','))
  }
  return request<PreparedExerciseResponse>(
    `/lessons/${lessonId}/exercises/next?${search.toString()}`,
  )
}

export function getExercise(
  lessonId: string,
  exerciseId: string,
  routeVersionId: string,
  sourceLanguage = 'ru',
) {
  const search = new URLSearchParams({ sourceLanguage, routeVersionId })
  return request<PreparedExerciseResponse>(
    `/lessons/${lessonId}/exercises/${exerciseId}?${search.toString()}`,
  )
}

export function encounterExercise(
  lessonId: string,
  exerciseId: string,
  routeVersionId: string,
) {
  const search = new URLSearchParams({ routeVersionId })
  return request<void>(
    `/lessons/${lessonId}/exercises/${exerciseId}/encounter?${search.toString()}`,
    { method: 'PUT' },
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

export function reportExercise(
  exerciseId: string,
  report: ExerciseReportRequest,
) {
  return request<ExerciseReportResponse>(`/exercises/${exerciseId}/reports`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(report),
  })
}

export function getAdminReports(status?: ExerciseReportStatus) {
  const search = status ? `?${new URLSearchParams({ status })}` : ''
  return request<AdminExerciseReportListResponse>(`/admin/reports${search}`)
}

export function updateAdminReportStatus(
  reportId: string,
  update: UpdateExerciseReportStatusRequest,
) {
  return request<AdminExerciseReportResponse>(`/admin/reports/${reportId}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(update),
  })
}

export async function downloadAdminReports(status?: ExerciseReportStatus) {
  const search = status ? `?${new URLSearchParams({ status })}` : ''
  const response = await fetch(`${apiUrl}/admin/reports/export${search}`, {
    credentials: 'include',
  })
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string | string[]
    } | null
    const message = Array.isArray(payload?.message)
      ? payload.message.join(', ')
      : payload?.message
    throw new ApiError(
      message || 'Не удалось выгрузить жалобы',
      response.status,
    )
  }

  const data = (await response.json()) as AdminExerciseReportExportResponse
  const disposition = response.headers.get('content-disposition')
  const filename = disposition?.match(/filename="?([^";]+)"?/u)?.[1]
  return {
    data,
    filename:
      filename ?? `exercise-reports-${status?.toLowerCase() ?? 'all'}.json`,
  }
}

export function getCourseProgress(routeVersionId: string) {
  return request<CourseProgressResponse>(
    `/me/course-progress/${routeVersionId}`,
  )
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

export function reviewVocabularyItem(
  routeVersionId: string,
  itemId: string,
  study: VocabularyStudyRequest,
) {
  return request<VocabularyStudyResponse>(
    `/me/vocabulary/${routeVersionId}/${itemId}/review`,
    {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(study),
    },
  )
}

export function changeVocabularyMemoryStatus(
  routeVersionId: string,
  itemId: string,
  status: WordMemoryStatus,
) {
  return request<VocabularyStudyResponse>(
    `/me/vocabulary/${routeVersionId}/${itemId}/status`,
    {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    },
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

export async function loadAudioFile(audioUrl: string): Promise<Blob> {
  const response = await fetch(audioUrl, { credentials: 'include' })
  if (!response.ok) {
    throw new ApiError('Не удалось полностью загрузить аудио', response.status)
  }
  return response.blob()
}

export function exportAccountData() {
  return request<AccountDataExportResponse>('/me/data-export')
}

export function getAccountAuthMethods() {
  return request<AccountAuthMethodsResponse>('/me/auth-methods')
}

export function setAccountPassword(input: SetAccountPasswordRequest) {
  return request<void>('/me/password', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
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

export function completePractice(routeVersionId: string, lessonId: string) {
  return request<PracticeCompletionResponse>(
    `/me/course-progress/${routeVersionId}/lessons/${lessonId}/practice-completion`,
    { method: 'POST' },
  )
}

export function startOrResumePractice(
  routeVersionId: string,
  lessonId: string,
) {
  return request<PracticeSessionResponse>(
    `/me/course-progress/${routeVersionId}/lessons/${lessonId}/practice-session`,
    { method: 'PUT' },
  )
}

export function startOrResumeVocabulary(
  routeVersionId: string,
  lessonId: string,
) {
  return request<LessonVocabularyStudySessionResponse>(
    `/me/course-progress/${routeVersionId}/lessons/${lessonId}/vocabulary-session`,
    { method: 'PUT' },
  )
}

export function encounterVocabularyItem(
  routeVersionId: string,
  lessonId: string,
  itemId: string,
) {
  return request<void>(
    `/me/course-progress/${routeVersionId}/lessons/${lessonId}/vocabulary/${itemId}/encounter`,
    { method: 'PUT' },
  )
}

export function submitVocabularyAnswer(
  routeVersionId: string,
  lessonId: string,
  itemId: string,
  answer: LessonVocabularyAnswerRequest,
) {
  return request<LessonVocabularyAnswerResponse>(
    `/me/course-progress/${routeVersionId}/lessons/${lessonId}/vocabulary/${itemId}/attempts`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(answer),
    },
  )
}
