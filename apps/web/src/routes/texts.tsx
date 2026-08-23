import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRightIcon, HeadphonesIcon } from 'lucide-react'
import { useState } from 'react'

import { courseQuery, preparedTextsQuery } from '@/api/queries'
import { preloadCourseRoute } from '@/api/route-preload'
import { LearningPageHeader } from '@/components/learning-page-header'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { localizedText } from '@/lib/localized-text'
import {
  filterPreparedTexts,
  getTextFilterOptions,
  type TextCatalogFilters,
} from '@/lib/text-filters'

export const Route = createFileRoute('/texts')({
  loader: ({ context }) =>
    preloadCourseRoute(context.queryClient, (routeVersionId, queryClient) =>
      queryClient.ensureQueryData(preparedTextsQuery(routeVersionId)),
    ),
  component: TextsPage,
})

function TextsPage() {
  const [filters, setFilters] = useState<TextCatalogFilters>({
    level: 'all',
    topic: 'all',
    grammarItemId: 'all',
    familiarity: 'all',
  })
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

  const options = getTextFilterOptions(texts.data.items)
  const visibleTexts = filterPreparedTexts(texts.data.items, filters)
  const hasActiveFilters = Object.values(filters).some(
    (filter) => filter !== 'all',
  )

  return (
    <PageShell>
      <LearningPageHeader
        eyebrow="Чтение с разбором"
        title="Тексты"
        description="Читай короткие истории и нажимай на слова, чтобы увидеть форму и значение."
      />

      <section className="mt-5 grid gap-2 rounded-lg border bg-card p-3 sm:grid-cols-2 lg:grid-cols-4">
        <TextFilter
          label="Уровень"
          value={filters.level}
          options={options.levels.map((value) => ({ value, label: value }))}
          onChange={(level) => setFilters((current) => ({ ...current, level }))}
        />
        <TextFilter
          label="Тема"
          value={filters.topic}
          options={options.topics.map((value) => ({ value, label: value }))}
          onChange={(topic) => setFilters((current) => ({ ...current, topic }))}
        />
        <TextFilter
          label="Грамматика"
          value={filters.grammarItemId}
          options={options.grammarItems.map((item) => ({
            value: item.itemId,
            label: localizedText(item.label),
          }))}
          onChange={(grammarItemId) =>
            setFilters((current) => ({ ...current, grammarItemId }))
          }
        />
        <TextFilter
          label="Знакомая лексика"
          value={filters.familiarity}
          options={[
            { value: 'known', label: '80% и больше' },
            { value: 'learning', label: '30–79%' },
            { value: 'new', label: 'меньше 30%' },
          ]}
          onChange={(familiarity) =>
            setFilters((current) => ({
              ...current,
              familiarity: familiarity as TextCatalogFilters['familiarity'],
            }))
          }
        />
        {hasActiveFilters ? (
          <Button
            className="justify-self-start lg:col-span-4"
            size="sm"
            variant="ghost"
            onClick={() =>
              setFilters({
                level: 'all',
                topic: 'all',
                grammarItemId: 'all',
                familiarity: 'all',
              })
            }
          >
            Сбросить фильтры
          </Button>
        ) : null}
      </section>

      {visibleTexts.length > 0 ? (
        <ul className="mt-5 overflow-hidden rounded-lg border bg-card">
          {visibleTexts.map((text) => (
            <li
              key={text.id}
              className="border-t px-4 py-4 first:border-t-0 sm:px-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">{text.level}</Badge>
                    {text.topics.map((topic) => (
                      <span
                        key={topic}
                        className="text-xs text-muted-foreground"
                      >
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
      ) : (
        <section className="mt-5 rounded-lg border border-dashed p-5">
          <h2 className="text-sm font-semibold">Подходящих текстов нет</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Измени или сбрось фильтры.
          </p>
        </section>
      )}
    </PageShell>
  )
}

function TextFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-muted-foreground">
      {label}
      <select
        className="h-9 min-w-0 rounded-md border bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="all">Все</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
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
