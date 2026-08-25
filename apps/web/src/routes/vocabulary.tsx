import type {
  ReviewMemoryState,
  UserVocabularyItemResponse,
} from '@language/contracts'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  BookOpenIcon,
  BrainIcon,
  ChevronDownIcon,
  SearchIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { courseQuery, userVocabularyQuery } from '@/api/queries'
import { preloadCourseRoute } from '@/api/route-preload'
import { LearningPageHeader } from '@/components/learning-page-header'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { localizedText } from '@/lib/localized-text'
import { cn } from '@/lib/utils'
import {
  matchesVocabularyFilter,
  matchesVocabularySearch,
  type VocabularyFilter,
} from '@/lib/vocabulary-filter'
import {
  getVocabularyFormDimensions,
  getVocabularyFormLabel,
  getVocabularyFormsForDisplay,
  getVocabularyMorphology,
  matchesVocabularyFormSelections,
  type VocabularyFormSelections,
} from '@/lib/vocabulary-morphology'

export const Route = createFileRoute('/vocabulary')({
  validateSearch: (search: Record<string, unknown>): VocabularySearch => ({
    q:
      typeof search.q === 'string' && search.q.trim()
        ? search.q.slice(0, 100)
        : undefined,
    filter: isVocabularyFilter(search.filter) ? search.filter : undefined,
  }),
  loader: ({ context }) =>
    preloadCourseRoute(context.queryClient, (routeVersionId, queryClient) =>
      queryClient.ensureQueryData(userVocabularyQuery(routeVersionId)),
    ),
  component: VocabularyPage,
})

const filters: Array<{ id: VocabularyFilter; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'due', label: 'Пора повторить' },
  { id: 'new', label: 'Новые' },
  { id: 'learning', label: 'Изучаются' },
  { id: 'review', label: 'Выучены' },
]

interface VocabularySearch {
  q?: string
  filter?: VocabularyFilter
}

const stateLabels: Record<ReviewMemoryState, string> = {
  NEW: 'Новое',
  LEARNING: 'Изучается',
  REVIEW: 'Выучено',
  RELEARNING: 'Изучается',
}

const stateClasses: Record<ReviewMemoryState, string> = {
  NEW: 'border-border bg-background text-foreground',
  LEARNING:
    'border-amber-500/30 bg-amber-400/15 text-amber-900 dark:text-amber-200',
  REVIEW:
    'border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200',
  RELEARNING:
    'border-amber-500/30 bg-amber-400/15 text-amber-900 dark:text-amber-200',
}

function VocabularyPage() {
  const searchParams = Route.useSearch()
  const navigate = Route.useNavigate()
  const search = searchParams.q ?? ''
  const filter = searchParams.filter ?? 'all'
  const course = useQuery(courseQuery)
  const routeVersionId = course.data?.route?.id ?? ''
  const vocabulary = useQuery({
    ...userVocabularyQuery(routeVersionId),
    enabled: Boolean(routeVersionId),
  })
  const visibleItems = useMemo(
    () =>
      vocabulary.data?.items.filter(
        (item) =>
          matchesVocabularySearch(item, search) &&
          matchesVocabularyFilter(item, filter),
      ) ?? [],
    [filter, search, vocabulary.data?.items],
  )

  if (course.isPending || vocabulary.isPending) return <PageState loading />
  if (course.isError || vocabulary.isError) {
    return <PageState message={(course.error ?? vocabulary.error)?.message} />
  }

  const firstLessonId = course.data.route?.lessons[0]?.id
  const hasWords = vocabulary.data.counts.all > 0

  return (
    <PageShell>
      <LearningPageHeader
        eyebrow="Слова и повторение"
        title="Мои слова"
        description={`${formatWordCount(vocabulary.data.counts.all)} в словаре · ${formatDueCount(vocabulary.data.counts.due)}`}
        aside={
          vocabulary.data.counts.due > 0 ? (
            <Button asChild className="w-full" size="sm">
              <Link to="/reviews/session">
                <BrainIcon /> Повторить
              </Link>
            </Button>
          ) : (
            <Button className="w-full" disabled size="sm">
              <BrainIcon /> Повторений пока нет
            </Button>
          )
        }
      />

      <section className="mt-5" aria-label="Поиск и фильтры словаря">
        <div className="relative max-w-md">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Поиск по слову или переводу"
            className="pl-9"
            placeholder="Слово или перевод"
            value={search}
            onChange={(event) => {
              const q = event.target.value
              void navigate({
                replace: true,
                search: (current) => ({
                  ...current,
                  q: q || undefined,
                }),
              })
            }}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Фильтр слов">
          {filters.map((item) => (
            <Button
              key={item.id}
              size="sm"
              variant={filter === item.id ? 'secondary' : 'ghost'}
              aria-pressed={filter === item.id}
              onClick={() => {
                void navigate({
                  replace: true,
                  search: (current) => ({
                    ...current,
                    filter: item.id === 'all' ? undefined : item.id,
                  }),
                })
              }}
            >
              {item.label}
              <span className="tabular-nums text-muted-foreground">
                {vocabulary.data.counts[item.id]}
              </span>
            </Button>
          ))}
        </div>
      </section>

      {!hasWords ? (
        <section className="motion-feedback mt-6 rounded-lg border border-dashed p-5">
          <BookOpenIcon className="size-5 text-primary" />
          <h2 className="mt-3 text-sm font-semibold">Словарь пока пуст</h2>
          <p className="mt-1 max-w-lg text-sm leading-6 text-muted-foreground">
            Здесь появятся только слова, которые ты начал учить в уроках или
            добавил во время чтения.
          </p>
          {firstLessonId ? (
            <Button asChild className="mt-4" size="sm" variant="outline">
              <Link
                to="/lessons/$lessonId/vocabulary"
                params={{ lessonId: firstLessonId }}
              >
                Начать учить слова
              </Link>
            </Button>
          ) : null}
        </section>
      ) : visibleItems.length === 0 ? (
        <section className="motion-feedback mt-6 rounded-lg border border-dashed p-5">
          <h2 className="text-sm font-semibold">Ничего не найдено</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Измени запрос или выбери другой фильтр.
          </p>
        </section>
      ) : (
        <VocabularyList items={visibleItems} />
      )}
    </PageShell>
  )
}

function isVocabularyFilter(value: unknown): value is VocabularyFilter {
  return filters.some((filter) => filter.id === value)
}

function VocabularyList({ items }: { items: UserVocabularyItemResponse[] }) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  function toggleItem(itemId: string) {
    setExpandedItems((current) => {
      const next = new Set(current)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  return (
    <section className="mt-5 overflow-hidden rounded-lg border bg-card">
      <div className="hidden grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto_1.25rem] gap-5 bg-muted/35 px-4 py-2 text-xs font-medium text-muted-foreground sm:grid">
        <span>Слово</span>
        <span>Перевод</span>
        <span>Статус</span>
        <span className="sr-only">Раскрыть</span>
      </div>
      <ul>
        {items.map((item) => {
          const expanded = expandedItems.has(item.itemId)
          const detailsId = `vocabulary-details-${item.itemId.replaceAll('.', '-')}`

          return (
            <li key={item.itemId} className="border-t first:border-t-0">
              <button
                type="button"
                aria-controls={detailsId}
                aria-expanded={expanded}
                className="interactive-row grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto_1.25rem] sm:gap-5"
                onClick={() => toggleItem(item.itemId)}
              >
                <span className="min-w-0 truncate text-sm font-semibold sm:text-base">
                  {item.lemma}
                </span>
                <span className="min-w-0 truncate text-sm text-muted-foreground max-sm:col-span-2 max-sm:row-start-2">
                  {localizedText(item.gloss)}
                </span>
                <span className="flex items-center justify-end">
                  <Badge
                    className={stateClasses[item.memory.state]}
                    variant="outline"
                  >
                    {stateLabels[item.memory.state]}
                  </Badge>
                </span>
                <ChevronDownIcon
                  className={cn(
                    'hidden size-4 text-muted-foreground transition-transform duration-200 sm:block',
                    expanded && 'rotate-180',
                  )}
                />
              </button>

              {expanded ? (
                <VocabularyDetails id={detailsId} item={item} />
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function VocabularyDetails({
  id,
  item,
}: {
  id: string
  item: UserVocabularyItemResponse
}) {
  const [showAllForms, setShowAllForms] = useState(false)
  const [selections, setSelections] = useState<VocabularyFormSelections>({})
  const morphology = getVocabularyMorphology(item)
  const allForms = getVocabularyFormsForDisplay(item.forms)
  const dimensions = getVocabularyFormDimensions(allForms)
  const visibleForms = allForms.filter((form) =>
    matchesVocabularyFormSelections(form, selections),
  )
  const hasSelections = Object.values(selections).some(Boolean)

  return (
    <div
      id={id}
      className="motion-feedback border-t bg-muted/20 px-4 py-5 sm:px-5"
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h3 className="text-lg font-semibold tracking-tight">{item.lemma}</h3>
        <span className="text-sm text-muted-foreground">
          — {localizedText(item.gloss)}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="font-medium">{morphology.partOfSpeechLabel}</span>
        {morphology.typeLabel ? (
          <>
            <span aria-hidden="true" className="text-muted-foreground/60">
              ·
            </span>
            <span className="font-medium">{morphology.typeLabel}</span>
          </>
        ) : null}
      </div>

      {morphology.stems.length > 0 || morphology.gradation ? (
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {morphology.stems.length > 0 ? (
            <div className="flex gap-1.5">
              <dt className="text-muted-foreground">Основа:</dt>
              <dd className="font-semibold">
                {morphology.stems.map((stem) => `${stem}-`).join(' / ')}
              </dd>
            </div>
          ) : null}
          {morphology.gradation ? (
            <div className="flex gap-1.5">
              <dt className="text-muted-foreground">Чередование согласных:</dt>
              <dd className="font-semibold">
                {morphology.gradation.from} → {morphology.gradation.to}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {morphology.change ? (
        <div className="mt-4 w-full rounded-md border bg-background/80 px-3.5 py-3 text-sm">
          <p className="font-medium">
            <span className="font-semibold">{item.lemma}</span>
            <span className="mx-2 text-muted-foreground">→</span>
            <span className="font-semibold">{morphology.change.surface}</span>
          </p>
          {morphology.change.ending ? (
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {morphology.change.stem}
              <span className="mx-1">+</span>
              <span className="rounded bg-primary/10 px-1 py-0.5 font-semibold text-primary">
                {morphology.change.ending}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}

      <section className="mt-5" aria-label="Основные формы слова">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Основные формы
        </h4>
        <ul className="mt-2 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          {morphology.keyForms.map(({ form, label }) => (
            <li
              key={form.id}
              className="flex min-w-0 items-baseline justify-between gap-3 border-b py-2 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-last-child(-n+3)]:border-b-0"
            >
              <span className="min-w-0 text-xs leading-5 text-muted-foreground">
                {label}
              </span>
              <span className="shrink-0 text-sm font-semibold">
                {form.surface}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Button
        aria-expanded={showAllForms}
        className="mt-4"
        size="sm"
        type="button"
        variant="outline"
        onClick={() => setShowAllForms((current) => !current)}
      >
        {showAllForms ? 'Скрыть формы' : 'Все формы'}
        <ChevronDownIcon
          className={cn(
            'transition-transform duration-200',
            showAllForms && 'rotate-180',
          )}
        />
      </Button>

      {showAllForms ? (
        <section
          className="motion-feedback mt-4 border-t pt-4"
          aria-label="Все формы слова"
        >
          {dimensions.length > 0 ? (
            <div className="flex flex-wrap items-end gap-2">
              {dimensions.map((dimension) => (
                <label key={dimension.key} className="grid gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {dimension.label}
                  </span>
                  <select
                    className="h-9 min-w-32 rounded-md border bg-background px-2.5 text-sm outline-none transition-shadow focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    value={selections[dimension.key] ?? ''}
                    onChange={(event) =>
                      setSelections((current) => ({
                        ...current,
                        [dimension.key]: event.target.value,
                      }))
                    }
                  >
                    <option value="">Все</option>
                    {dimension.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              {hasSelections ? (
                <Button
                  size="sm"
                  type="button"
                  variant="ghost"
                  onClick={() => setSelections({})}
                >
                  Сбросить
                </Button>
              ) : null}
            </div>
          ) : null}

          {visibleForms.length > 0 ? (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {visibleForms.map((form) => (
                <li
                  key={form.id}
                  className="rounded-md border bg-background px-3 py-2"
                >
                  <span className="text-sm font-semibold">{form.surface}</span>
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {getVocabularyFormLabel(form)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Такой комбинации формы нет. Измени параметры или сбрось фильтры.
            </p>
          )}
        </section>
      ) : null}
    </div>
  )
}

function formatWordCount(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100
  const ending =
    mod10 === 1 && mod100 !== 11
      ? 'слово'
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? 'слова'
        : 'слов'
  return `${count} ${ending}`
}

function formatDueCount(count: number) {
  return count === 0 ? 'на сегодня всё' : `${count} пора повторить`
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
