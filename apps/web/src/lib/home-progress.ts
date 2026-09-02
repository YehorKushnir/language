import type { LessonPart, LessonProgressResponse } from '@language/contracts'

const lessonParts: Array<{
  part: LessonPart
  completedAt: keyof Pick<
    LessonProgressResponse,
    'explanationCompletedAt' | 'vocabularyCompletedAt' | 'practiceCompletedAt'
  >
}> = [
  { part: 'explanation', completedAt: 'explanationCompletedAt' },
  { part: 'vocabulary', completedAt: 'vocabularyCompletedAt' },
  { part: 'practice', completedAt: 'practiceCompletedAt' },
]

export function getNextLessonPart(
  progress: LessonProgressResponse | undefined,
): LessonPart {
  return (
    lessonParts.find(({ completedAt }) => !progress?.[completedAt])?.part ??
    'explanation'
  )
}

export function getCompletedLessonPartCount(
  progress: LessonProgressResponse | undefined,
) {
  return lessonParts.filter(({ completedAt }) => progress?.[completedAt]).length
}

export function isLessonPartComplete(
  progress: LessonProgressResponse | undefined,
  part: LessonPart,
) {
  const definition = lessonParts.find((item) => item.part === part)
  return Boolean(definition && progress?.[definition.completedAt])
}

export function getLatestAvailableLesson<
  Lesson extends { id: string; prerequisiteLessonIds: string[] },
>(lessons: Lesson[], progress: LessonProgressResponse[]): Lesson | undefined {
  const completedLessonIds = new Set(
    progress
      .filter((lesson) => lesson.completedAt)
      .map((lesson) => lesson.lessonId),
  )
  let latestAvailableLesson: Lesson | undefined

  for (const lesson of lessons) {
    if (
      lesson.prerequisiteLessonIds.every((prerequisiteLessonId) =>
        completedLessonIds.has(prerequisiteLessonId),
      )
    ) {
      latestAvailableLesson = lesson
    }
  }

  return latestAvailableLesson ?? lessons[0]
}
