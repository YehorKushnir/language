import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { courseProgressQuery, courseQuery } from '@/api/queries'
import {
  CourseOutline,
  CourseOutlineSummary,
} from '@/components/course-outline'
import { LearningPageHeader } from '@/components/learning-page-header'
import { PageLoading, QueryError } from '@/components/query-state'

export const Route = createFileRoute('/lessons/')({
  component: LessonsPage,
})

function LessonsPage() {
  const course = useQuery(courseQuery)
  const routeVersionId = course.data?.route?.id ?? ''
  const progress = useQuery({
    ...courseProgressQuery(routeVersionId),
    enabled: Boolean(routeVersionId),
  })

  if (course.isPending) return <PageState loading />
  if (course.isError) return <PageState message={course.error.message} />

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-5 sm:py-10">
      <LearningPageHeader
        eyebrow="Курс русского → финского"
        title="5 разделов · 80 уроков"
        description="Нажми на доступный урок, чтобы открыть объяснение, слова и практику."
        aside={
          <CourseOutlineSummary
            completedLessons={progress.data?.completedLessons ?? 0}
          />
        }
      />
      <div className="mt-7">
        <CourseOutline course={course.data} progress={progress.data} />
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
