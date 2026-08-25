import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckIcon, LoaderCircleIcon } from 'lucide-react'

import { completeLessonPart } from '@/api/language-api'
import { courseProgressQuery, courseQuery, lessonQuery } from '@/api/queries'
import { LessonExplanationContent } from '@/components/lesson-explanation-content'
import { LessonWorkspaceHeader } from '@/components/lesson-workspace-header'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'
import { Button } from '@/components/ui/button'
import { localizedText } from '@/lib/localized-text'

export const Route = createFileRoute('/lessons/$lessonId_/explanation')({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(courseQuery),
      context.queryClient.ensureQueryData(lessonQuery(params.lessonId)),
    ]),
  component: LessonExplanationPage,
})

function LessonExplanationPage() {
  const { lessonId } = Route.useParams()
  const queryClient = useQueryClient()
  const lesson = useQuery(lessonQuery(lessonId))
  const course = useQuery(courseQuery)
  const routeVersionId = course.data?.route?.id ?? ''
  const progress = useQuery({
    ...courseProgressQuery(routeVersionId),
    enabled: Boolean(routeVersionId),
  })
  const completion = useMutation({
    mutationFn: () =>
      completeLessonPart(routeVersionId, lessonId, 'explanation'),
    onSuccess: (updatedProgress) => {
      queryClient.setQueryData(
        courseProgressQuery(routeVersionId).queryKey,
        updatedProgress,
      )
    },
  })

  if (lesson.isPending || course.isPending) return <PartPageState loading />
  if (lesson.isError || course.isError) {
    return <PartPageState message={(lesson.error ?? course.error)?.message} />
  }

  const lessonProgress = progress.data?.lessons.find(
    (item) => item.lessonId === lessonId,
  )
  const completed = Boolean(lessonProgress?.explanationCompletedAt)
  const screens = lesson.data.content.explanationScreens

  if (screens.length === 0) {
    return <PartPageState message="В уроке пока нет объяснения." />
  }

  return (
    <PageShell>
      <LessonWorkspaceHeader
        lessonId={lessonId}
        lessonTitle={localizedText(lesson.data.title)}
        lessonSummary={localizedText(lesson.data.summary)}
        activePart="explanation"
      />

      <LessonExplanationContent screens={screens} />

      {completion.isError ? (
        <div className="mb-4">
          <QueryError message={completion.error.message} />
        </div>
      ) : null}

      <footer className="flex flex-wrap items-center justify-between gap-3 py-6">
        <p className="text-sm text-muted-foreground">
          {completed
            ? 'Объяснение отмечено как прочитанное.'
            : 'Можно вернуться к этому тексту в любой момент.'}
        </p>
        {completed ? (
          <Button asChild size="sm">
            <Link to="/lessons/$lessonId/vocabulary" params={{ lessonId }}>
              Перейти к словам
            </Link>
          </Button>
        ) : (
          <Button
            size="sm"
            disabled={!routeVersionId || completion.isPending}
            onClick={() => completion.mutate()}
          >
            {completion.isPending ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <CheckIcon />
            )}
            Отметить прочитанным
          </Button>
        )}
      </footer>
    </PageShell>
  )
}

function PartPageState({
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
