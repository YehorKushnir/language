import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { courseProgressQuery, courseQuery, lessonQuery } from '@/api/queries'
import {
  CourseOutline,
  CourseOutlineSummary,
} from '@/components/course-outline'
import { LearningPageHeader } from '@/components/learning-page-header'
import { PageLoading, QueryError } from '@/components/query-state'

export const Route = createFileRoute('/lessons/$lessonId')({
  component: LessonPage,
})

function LessonPage() {
  const { lessonId } = Route.useParams()
  const course = useQuery(courseQuery)
  const lesson = useQuery(lessonQuery(lessonId))
  const routeVersionId = course.data?.route?.id ?? ''
  const progress = useQuery({
    ...courseProgressQuery(routeVersionId),
    enabled: Boolean(routeVersionId),
  })

  if (course.isPending || lesson.isPending) return <PageState loading />
  if (course.isError || lesson.isError) {
    return <PageState message={(course.error ?? lesson.error)?.message} />
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-5 sm:py-10">
      <LearningPageHeader
        eyebrow="Курс русского → финского"
        title="5 разделов · 80 уроков"
        description="Выбери часть урока — она откроется в том же учебном пространстве."
        aside={
          <CourseOutlineSummary
            completedLessons={progress.data?.completedLessons ?? 0}
          />
        }
      />
      <div className="mt-7">
        <CourseOutline
          course={course.data}
          progress={progress.data}
          selectedLessonId={lessonId}
        />
      </div>
    </main>
  )
}

function PageState({
  loading = false,
  message,
}: {
  loading?: boolean
  message?: string
}) {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10">
      {loading ? <PageLoading /> : <QueryError message={message} />}
    </main>
  )
}
