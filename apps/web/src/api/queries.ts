import { queryOptions } from '@tanstack/react-query'

import {
  getCourse,
  getCourseProgress,
  getLesson,
  getLessonVocabulary,
  getNextExercise,
  getNextReview,
  getPreparedText,
  getPreparedTexts,
  getUserVocabulary,
  startOrResumePractice,
} from './language-api'

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
    gcTime: 1_000,
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

export function nextReviewQuery(
  routeVersionId: string,
  excludedExerciseIds: string[] = [],
) {
  return queryOptions({
    queryKey: ['next-review', routeVersionId, 'ru', excludedExerciseIds],
    queryFn: () => getNextReview(routeVersionId, 'ru', excludedExerciseIds),
  })
}
