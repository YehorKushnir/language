import type { PreparedTextSummaryResponse } from '@language/contracts'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRightIcon, FileTextIcon } from 'lucide-react'
import { useMemo } from 'react'

import { courseQuery, preparedTextsQuery } from '@/api/queries'
import { preloadCourseRoute } from '@/api/route-preload'
import { LearningPageHeader } from '@/components/learning-page-header'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'
import { Progress } from '@/components/ui/progress'
import { localizedText } from '@/lib/localized-text'

export const Route = createFileRoute('/texts')({
  validateSearch: (search: Record<string, unknown>): TextsSearch => ({
    readiness: search.readiness === 'ready' ? 'ready' : undefined,
    level: isTextCategory(search.level) ? search.level : undefined,
    topic:
      typeof search.topic === 'string' && search.topic.trim()
        ? search.topic.slice(0, 100)
        : undefined,
  }),
  loader: ({ context }) =>
    preloadCourseRoute(context.queryClient, (routeVersionId, queryClient) =>
      queryClient.ensureQueryData(preparedTextsQuery(routeVersionId)),
    ),
  component: TextsPage,
})

const textCategories = [
  { level: 'A1', title: 'Начальный уровень' },
  { level: 'A2', title: 'Базовый уровень' },
  { level: 'B1', title: 'Средний уровень' },
  { level: 'B2', title: 'Выше среднего' },
] as const

type TextCategory = (typeof textCategories)[number]['level']

interface TextsSearch {
  readiness?: 'ready'
  level?: TextCategory
  topic?: string
}

function TextsPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const readiness = search.readiness ?? 'all'
  const level = search.level ?? 'all'
  const topic = search.topic ?? 'all'
  const course = useQuery(courseQuery)
  const routeVersionId = course.data?.route?.id ?? ''
  const texts = useQuery({
    ...preparedTextsQuery(routeVersionId),
    enabled: Boolean(routeVersionId),
  })
  const topics = useMemo(
    () =>
      [...new Set(texts.data?.items.flatMap((text) => text.topics) ?? [])].sort(
        (left, right) => left.localeCompare(right, 'ru'),
      ),
    [texts.data?.items],
  )

  if (course.isPending || texts.isPending) return <PageState loading />
  if (course.isError || texts.isError) {
    return <PageState message={(course.error ?? texts.error)?.message} />
  }
  const visibleTexts = texts.data.items.filter(
    (text) =>
      (readiness === 'all' || text.isGrammarReady) &&
      (level === 'all' || toTextCategory(text.level) === level) &&
      (topic === 'all' || text.topics.includes(topic)),
  )
  const textsByCategory = new Map<TextCategory, PreparedTextSummaryResponse[]>(
    textCategories.map(({ level }) => [level, []]),
  )

  for (const text of visibleTexts) {
    textsByCategory.get(toTextCategory(text.level))?.push(text)
  }

  return (
    <PageShell>
      <LearningPageHeader
        eyebrow="Чтение с разбором"
        title="Тексты"
        description="Читай тексты своего уровня и сразу проверяй значение незнакомых слов."
      />

      <section
        className="mt-6 grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[auto_minmax(9rem,0.7fr)_minmax(10rem,1fr)] sm:items-end"
        aria-label="Фильтры текстов"
      >
        <div className="flex rounded-lg bg-muted p-1" aria-label="Доступность">
          {(
            [
              ['all', 'Все тексты'],
              ['ready', 'Подходят сейчас'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={readiness === value}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                readiness === value
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => {
                void navigate({
                  replace: true,
                  search: (current) => ({
                    ...current,
                    readiness: value === 'all' ? undefined : value,
                  }),
                })
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="grid gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            Уровень
          </span>
          <select
            className="h-9 min-w-0 rounded-md border bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            value={level}
            onChange={(event) => {
              const value = event.target.value
              void navigate({
                replace: true,
                search: (current) => ({
                  ...current,
                  level: isTextCategory(value) ? value : undefined,
                }),
              })
            }}
          >
            <option value="all">Все уровни</option>
            {textCategories.map((category) => (
              <option key={category.level} value={category.level}>
                {category.level} · {category.title}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            Тема
          </span>
          <select
            className="h-9 min-w-0 rounded-md border bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            value={topic}
            onChange={(event) => {
              const value = event.target.value
              void navigate({
                replace: true,
                search: (current) => ({
                  ...current,
                  topic: value === 'all' ? undefined : value,
                }),
              })
            }}
          >
            <option value="all">Все темы</option>
            {topics.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </section>

      {visibleTexts.length === 0 ? (
        <section className="mt-6 rounded-xl border border-dashed p-6 text-center">
          <h2 className="text-sm font-semibold">Подходящих текстов пока нет</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Заверши следующий контрольный урок или измени фильтры.
          </p>
        </section>
      ) : null}

      <div className="mt-7 grid min-w-0 gap-9">
        {textCategories.map((category) => {
          const categoryTexts = textsByCategory.get(category.level) ?? []
          if (categoryTexts.length === 0) return null

          return (
            <section key={category.level} className="min-w-0">
              <header className="flex items-baseline justify-between gap-4 border-b px-1 pb-3">
                <h2 className="font-serif text-xl font-semibold">
                  {category.level} · {category.title}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {formatTextCount(categoryTexts.length)}
                </span>
              </header>

              {categoryTexts.length > 0 ? (
                <ol className="mt-3 grid min-w-0 gap-2">
                  {categoryTexts.map((text, index) => (
                    <li key={text.id}>
                      <Link
                        to="/texts/$textId"
                        params={{ textId: text.id }}
                        aria-label={`Открыть ${localizedText(text.title)}`}
                        className="interactive-row group flex min-h-16 min-w-0 items-center gap-3 rounded-xl border bg-card px-3 py-3 shadow-xs transition-[border-color,box-shadow,transform] duration-150 hover:border-primary/25 hover:shadow-sm active:scale-[0.998] sm:gap-3.5 sm:px-5"
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium tabular-nums text-muted-foreground">
                          {index + 1}
                        </span>
                        <FileTextIcon className="hidden size-4 shrink-0 text-primary/65 sm:block" />
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-[15px] font-medium leading-5 sm:text-base">
                            {localizedText(text.title)}
                          </h3>
                          <p className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                            <span>{text.wordCount} слов</span>
                            <span className="sm:hidden">
                              {text.knownPercent}% знакомых
                            </span>
                            {!text.isGrammarReady ? (
                              <span>грамматика ещё впереди</span>
                            ) : null}
                          </p>
                        </div>
                        <div className="hidden w-36 shrink-0 sm:block">
                          <Progress
                            className="h-1.5"
                            value={text.knownPercent}
                            aria-label={`Знакомые слова в тексте ${localizedText(text.title)}`}
                          />
                        </div>
                        <span className="hidden min-w-24 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground sm:block">
                          {text.knownPercent}% знакомых
                        </span>
                        <span className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-[background-color,color,transform] duration-150 group-hover:translate-x-0.5 group-hover:bg-secondary group-hover:text-primary sm:size-8">
                          <ArrowRightIcon className="size-4" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed px-5 py-5 text-sm text-muted-foreground">
                  Тексты этого уровня появятся позже.
                </div>
              )}
            </section>
          )
        })}
      </div>
    </PageShell>
  )
}

function toTextCategory(level: string): TextCategory {
  const normalized = level.trim().toLocaleUpperCase('en')
  if (normalized.startsWith('A2')) return 'A2'
  if (normalized.startsWith('B1')) return 'B1'
  if (normalized.startsWith('B2')) return 'B2'
  return 'A1'
}

function isTextCategory(value: unknown): value is TextCategory {
  return textCategories.some((category) => category.level === value)
}

function formatTextCount(count: number): string {
  if (count === 1) return '1 текст'
  if (count > 1 && count < 5) return `${count} текста`
  return `${count} текстов`
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
