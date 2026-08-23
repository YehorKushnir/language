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
