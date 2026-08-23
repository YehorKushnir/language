import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRightIcon, BookOpenIcon, CalendarClockIcon } from 'lucide-react'

import { courseProgressQuery, courseQuery } from '@/api/queries'
import { preloadCourseRoute } from '@/api/route-preload'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { authClient } from '@/lib/auth-client'
import { localizedText } from '@/lib/localized-text'

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    preloadCourseRoute(context.queryClient, (routeVersionId, queryClient) =>
      queryClient.ensureQueryData(courseProgressQuery(routeVersionId)),
    ),
  component: HomePage,
})

function HomePage() {
  const session = authClient.useSession()
  const course = useQuery(courseQuery)
  const routeVersionId = course.data?.route?.id ?? ''
  const progress = useQuery({
    ...courseProgressQuery(routeVersionId),
    enabled: Boolean(routeVersionId && session.data),
  })

  if (course.isPending) return <PageState loading />
  if (course.isError) return <PageState message={course.error.message} />

  const currentLessonId =
    progress.data?.currentLessonId ?? course.data.route?.lessons[0]?.id
  const completedLessons = progress.data?.completedLessons ?? 0

  return (
    <PageShell className="py-10 sm:py-14">
      <section className="grid gap-8 border-b pb-9 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Русский → финский
          </p>
          <h1 className="mt-2 max-w-2xl font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Финский как система, а не набор фраз
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            {localizedText(course.data.description) ||
              'Грамматика, слова и практика с интервальным повторением.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {session.data && currentLessonId ? (
            <Button asChild size="sm">
              <Link
                to="/lessons/$lessonId/explanation"
                params={{ lessonId: currentLessonId }}
              >
                Продолжить <ArrowRightIcon />
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/sign-up">
                Начать <ArrowRightIcon />
              </Link>
            </Button>
          )}
          <Button asChild size="sm" variant="outline">
            <Link to="/lessons">Программа курса</Link>
          </Button>
        </div>
      </section>

      <section className="mt-7 grid gap-3 sm:grid-cols-[1fr_220px]">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Текущий курс</p>
              <h2 className="mt-0.5 text-sm font-semibold">
                {localizedText(course.data.title)}
              </h2>
            </div>
            <BookOpenIcon className="size-4 text-primary" />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Progress value={(completedLessons / 80) * 100} className="h-1.5" />
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {completedLessons} / 80
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            5 разделов по 16 уроков
          </p>
        </div>

        <Link
          to="/reviews"
          className="flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary/35 hover:bg-accent/40"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary text-primary">
            <CalendarClockIcon className="size-4" />
          </span>
          <span>
            <span className="block text-xs text-muted-foreground">
              Повторение
            </span>
            <span className="mt-0.5 block text-sm font-semibold">
              {progress.data?.dueReviews ?? 0} на сегодня
            </span>
          </span>
        </Link>
      </section>
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
