import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { courseProgressQuery, courseQuery, lessonQuery } from '@/api/queries'
import { preloadCourseRoute } from '@/api/route-preload'
import {
  CourseOutline,
  CourseOutlineSummary,
} from '@/components/course-outline'
import { LearningPageHeader } from '@/components/learning-page-header'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'

export const Route = createFileRoute('/lessons/$lessonId')({
  loader: ({ context, params }) =>
    Promise.all([
      preloadCourseRoute(context.queryClient, (routeVersionId, queryClient) =>
        queryClient.ensureQueryData(courseProgressQuery(routeVersionId)),
      ),
      context.queryClient.ensureQueryData(lessonQuery(params.lessonId)),
    ]),
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
  const totalLessons = course.data.route?.lessons.length ?? 0

  return (
    <PageShell>
      <LearningPageHeader
        eyebrow="Русский → финский"
        title={`Первый модуль · ${totalLessons} уроков`}
        description="Выбери часть урока — она откроется в том же учебном пространстве."
        aside={
          <CourseOutlineSummary
            completedLessons={progress.data?.completedLessons ?? 0}
            totalLessons={totalLessons}
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
