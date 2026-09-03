import { queryOptions } from '@tanstack/react-query'

import {
  getAdminReports,
  getCourse,
  getCourseProgress,
  getExercise,
  getLesson,
  getLessonVocabulary,
  loadAudioFile,
  getNextExercise,
  getNextReview,
  getPreparedText,
  getPreparedTexts,
  getUserVocabulary,
  startOrResumePractice,
  startOrResumeVocabulary,
} from './language-api'
import type { ExerciseReportStatus } from '@language/contracts'

export function adminReportsQuery(status?: ExerciseReportStatus) {
  return queryOptions({
    queryKey: ['admin-reports', status ?? 'ALL'],
    queryFn: () => getAdminReports(status),
  })
}

export const courseQuery = queryOptions({
  queryKey: ['course', 'course.ru-fi'],
  queryFn: () => getCourse(),
})

export function lessonQuery(lessonId: string) {
  return queryOptions({
    queryKey: ['lesson', lessonId],
    queryFn: () => getLesson(lessonId),
  })
}

export function lessonVocabularyQuery(lessonId: string) {
  return queryOptions({
    queryKey: ['lesson-vocabulary', lessonId],
    queryFn: () => getLessonVocabulary(lessonId),
  })
}

export function nextExerciseQuery(
  lessonId: string,
  routeVersionId: string,
  excludedExerciseIds: string[] = [],
) {
  return queryOptions({
    queryKey: [
      'next-exercise',
      routeVersionId,
      lessonId,
      'ru',
      excludedExerciseIds,
    ],
    queryFn: () =>
      getNextExercise(lessonId, routeVersionId, 'ru', excludedExerciseIds),
    placeholderData: (previousExercise) => previousExercise,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function practiceExerciseQuery(
  lessonId: string,
  exerciseId: string,
  routeVersionId: string,
) {
  return queryOptions({
    queryKey: ['practice-exercise', routeVersionId, lessonId, exerciseId, 'ru'],
    queryFn: () => getExercise(lessonId, exerciseId, routeVersionId, 'ru'),
    staleTime: 5 * 60_000,
  })
}

export function courseProgressQuery(routeVersionId: string) {
  return queryOptions({
    queryKey: ['course-progress', routeVersionId],
    queryFn: () => getCourseProgress(routeVersionId),
  })
}

export function practiceSessionQuery(lessonId: string, routeVersionId: string) {
  return queryOptions({
    queryKey: ['practice-session', routeVersionId, lessonId],
    queryFn: () => startOrResumePractice(routeVersionId, lessonId),
    staleTime: 0,
    gcTime: 5 * 60_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function vocabularyStudySessionQuery(
  lessonId: string,
  routeVersionId: string,
) {
  return queryOptions({
    queryKey: ['vocabulary-study-session', routeVersionId, lessonId],
    queryFn: () => startOrResumeVocabulary(routeVersionId, lessonId),
    staleTime: 0,
    gcTime: 5 * 60_000,
    refetchOnMount: 'always',
  })
}

export function userVocabularyQuery(routeVersionId: string) {
  return queryOptions({
    queryKey: ['user-vocabulary', routeVersionId],
    queryFn: () => getUserVocabulary(routeVersionId),
  })
}

export function preparedTextsQuery(routeVersionId: string) {
  return queryOptions({
    queryKey: ['prepared-texts', routeVersionId],
    queryFn: () => getPreparedTexts(routeVersionId),
  })
}

export function preparedTextQuery(routeVersionId: string, textId: string) {
  return queryOptions({
    queryKey: ['prepared-text', routeVersionId, textId],
    queryFn: () => getPreparedText(routeVersionId, textId),
  })
}

export function textAudioFileQuery(audioUrl: string) {
  return queryOptions({
    queryKey: ['text-audio-file', audioUrl],
    queryFn: () => loadAudioFile(audioUrl),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 30 * 60_000,
    retry: 1,
  })
}

export function nextReviewQuery(
  routeVersionId: string,
  excludedExerciseIds: string[] = [],
  sequence = 0,
) {
  return queryOptions({
    queryKey: [
      'next-review',
      routeVersionId,
      'ru',
      excludedExerciseIds,
      sequence,
    ],
    queryFn: () => getNextReview(routeVersionId, 'ru', excludedExerciseIds),
    // A prefetched step gets its own sequence key. Keep it fresh long enough
    // for the user to read the feedback and continue without a second request.
    staleTime: sequence > 0 ? 30_000 : 0,
  })
}
