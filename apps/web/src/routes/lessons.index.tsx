import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { courseProgressQuery, courseQuery } from '@/api/queries'
import { preloadCourseRoute } from '@/api/route-preload'
import {
  CourseOutline,
  CourseOutlineSummary,
} from '@/components/course-outline'
import { LearningPageHeader } from '@/components/learning-page-header'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'

export const Route = createFileRoute('/lessons/')({
  loader: ({ context }) =>
    preloadCourseRoute(context.queryClient, (routeVersionId, queryClient) =>
      queryClient.ensureQueryData(courseProgressQuery(routeVersionId)),
    ),
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
    <PageShell>
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
    </PageShell>
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
    <PageShell>
      {loading ? <PageLoading /> : <QueryError message={message} />}
    </PageShell>
  )
}
