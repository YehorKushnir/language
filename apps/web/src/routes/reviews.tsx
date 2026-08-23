import type { ReviewMemoryState } from '@language/contracts'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRightIcon, BrainIcon } from 'lucide-react'

import { courseQuery, reviewQueueQuery } from '@/api/queries'
import { preloadCourseRoute } from '@/api/route-preload'
import { LearningPageHeader } from '@/components/learning-page-header'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { localizedText } from '@/lib/localized-text'

export const Route = createFileRoute('/reviews')({
  loader: ({ context }) =>
    preloadCourseRoute(context.queryClient, (routeVersionId, queryClient) =>
      queryClient.ensureQueryData(reviewQueueQuery(routeVersionId)),
    ),
  component: ReviewsPage,
})

const stateLabels: Record<ReviewMemoryState, string> = {
  NEW: 'Новое',
  LEARNING: 'Изучается',
  REVIEW: 'На повторении',
  RELEARNING: 'Переучивается',
}

function ReviewsPage() {
  const course = useQuery(courseQuery)
  const routeVersionId = course.data?.route?.id ?? ''
  const queue = useQuery({
    ...reviewQueueQuery(routeVersionId),
    enabled: Boolean(routeVersionId),
  })

  if (course.isPending || queue.isPending) return <PageState loading />
  if (course.isError || queue.isError) {
    return <PageState message={(course.error ?? queue.error)?.message} />
  }

  const currentLessonId = course.data.route?.lessons[0]?.id

  return (
    <PageShell>
      <LearningPageHeader
        eyebrow="Интервальное повторение"
        title="Повторение"
        description={`${queue.data.dueCount} сейчас · ${queue.data.totalCount} всего · следующее ${formatDueAt(queue.data.nextDueAt).toLowerCase()}`}
        aside={
          queue.data.dueCount > 0 ? (
            <Button asChild className="w-full" size="sm">
              <Link to="/reviews/session">
                Начать <ArrowRightIcon />
              </Link>
            </Button>
          ) : undefined
        }
      />

      {queue.data.items.length === 0 ? (
        <section className="motion-feedback mt-6 rounded-lg border border-dashed p-5">
          <BrainIcon className="size-5 text-primary" />
          <h2 className="mt-3 text-sm font-semibold">Память пока пуста</h2>
          <p className="mt-1 max-w-lg text-sm leading-6 text-muted-foreground">
            Изучи слова через flashcards или выполни практику — элементы сами
            появятся здесь со временем следующего повторения.
          </p>
          {currentLessonId ? (
            <Button asChild className="mt-4" size="sm" variant="outline">
              <Link
                to="/lessons/$lessonId/vocabulary"
                params={{ lessonId: currentLessonId }}
              >
                Изучить слова <ArrowRightIcon />
              </Link>
            </Button>
          ) : null}
        </section>
      ) : (
        <section className="mt-6 overflow-hidden rounded-lg border bg-card">
          <div className="grid grid-cols-[1fr_auto] gap-4 bg-muted/35 px-4 py-2 text-xs font-medium text-muted-foreground">
            <span>Элемент</span>
            <span>Следующее повторение</span>
          </div>
          <ul>
            {queue.data.items.map((item) => (
              <li
                key={item.itemId}
                className="interactive-row grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t px-4 py-3 first:border-t-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {localizedText(item.label)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {stateLabels[item.state]} · {item.repetitions} успешно ·{' '}
                    {item.lapses} ошибок
                  </p>
                </div>
                <Badge variant={item.isDue ? 'default' : 'outline'}>
                  {item.isDue ? 'Сейчас' : formatDueAt(item.dueAt)}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageShell>
  )
}

function formatDueAt(value: string | null): string {
  if (!value) return 'после изучения'
  const date = new Date(value)
  if (date <= new Date()) return 'сейчас'

  return new Intl.DateTimeFormat('ru', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
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
