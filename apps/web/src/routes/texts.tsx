import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRightIcon, HeadphonesIcon } from 'lucide-react'

import { courseQuery, preparedTextsQuery } from '@/api/queries'
import { preloadCourseRoute } from '@/api/route-preload'
import { LearningPageHeader } from '@/components/learning-page-header'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { localizedText } from '@/lib/localized-text'

export const Route = createFileRoute('/texts')({
  loader: ({ context }) =>
    preloadCourseRoute(context.queryClient, (routeVersionId, queryClient) =>
      queryClient.ensureQueryData(preparedTextsQuery(routeVersionId)),
    ),
  component: TextsPage,
})

function TextsPage() {
  const course = useQuery(courseQuery)
  const routeVersionId = course.data?.route?.id ?? ''
  const texts = useQuery({
    ...preparedTextsQuery(routeVersionId),
    enabled: Boolean(routeVersionId),
  })

  if (course.isPending || texts.isPending) return <PageState loading />
  if (course.isError || texts.isError) {
    return <PageState message={(course.error ?? texts.error)?.message} />
  }

  return (
    <PageShell>
      <LearningPageHeader
        eyebrow="Чтение с разбором"
        title="Тексты"
        description="Читай короткие истории, нажимай на слова и слушай финскую речь."
      />

      <ul className="mt-6 overflow-hidden rounded-lg border bg-card">
        {texts.data.items.map((text) => (
          <li
            key={text.id}
            className="border-t px-4 py-4 first:border-t-0 sm:px-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary">{text.level}</Badge>
                  {text.topics.map((topic) => (
                    <span key={topic} className="text-xs text-muted-foreground">
                      {topic}
                    </span>
                  ))}
                  {text.audioUrl ? (
                    <HeadphonesIcon
                      aria-label="Есть запись"
                      className="size-3.5 text-primary"
                    />
                  ) : null}
                </div>
                <h2 className="mt-2 text-base font-semibold">
                  {localizedText(text.title)}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {text.preview}
                </p>
              </div>
              <Button asChild size="icon-sm" variant="ghost">
                <Link
                  to="/texts/$textId"
                  params={{ textId: text.id }}
                  aria-label={`Открыть ${localizedText(text.title)}`}
                >
                  <ArrowRightIcon />
                </Link>
              </Button>
            </div>
            <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3">
              <Progress className="h-1.5" value={text.knownPercent} />
              <span className="text-xs tabular-nums text-muted-foreground">
                знакомо {text.knownWordCount}/{text.linkedWordCount}
              </span>
            </div>
          </li>
        ))}
      </ul>
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
