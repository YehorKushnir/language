import type {
  ReviewMemoryState,
  UserGrammarItemResponse,
  UserVocabularyItemResponse,
  WordMemoryStatus,
} from '@language/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  BookOpenIcon,
  BrainIcon,
  ChevronDownIcon,
  LanguagesIcon,
  SearchIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { changeVocabularyMemoryStatus } from '@/api/language-api'
import { courseQuery, userVocabularyQuery } from '@/api/queries'
import { preloadCourseRoute } from '@/api/route-preload'
import { LearningPageHeader } from '@/components/learning-page-header'
import { AudioButton } from '@/components/audio-button'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { localizedText } from '@/lib/localized-text'
import { cn } from '@/lib/utils'
import {
  matchesGrammarSearch,
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
    section: isVocabularySection(search.section) ? search.section : undefined,
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
  section?: VocabularySection
}

type VocabularySection = 'words' | 'grammar'

const stateLabels: Record<ReviewMemoryState, string> = {
  NEW: 'Новое',
  LEARNING: 'Изучается',
  REVIEW: 'Выучено',
  RELEARNING: 'Изучается',
}

const stateClasses: Record<ReviewMemoryState, string> = {
  NEW: 'border-border/70 bg-muted/55 text-muted-foreground',
  LEARNING: 'border-primary/20 bg-primary/10 text-primary',
  REVIEW: 'border-primary/20 bg-primary/12 text-primary',
  RELEARNING: 'border-primary/20 bg-primary/10 text-primary',
}

function VocabularyPage() {
  const queryClient = useQueryClient()
  const searchParams = Route.useSearch()
  const navigate = Route.useNavigate()
  const search = searchParams.q ?? ''
  const filter = searchParams.filter ?? 'all'
  const section = searchParams.section ?? 'words'
  const course = useQuery(courseQuery)
  const routeVersionId = course.data?.route?.id ?? ''
  const vocabulary = useQuery({
    ...userVocabularyQuery(routeVersionId),
    enabled: Boolean(routeVersionId),
  })
  const statusChange = useMutation({
    mutationFn: ({
      itemId,
      status,
    }: {
      itemId: string
      status: WordMemoryStatus
    }) => changeVocabularyMemoryStatus(routeVersionId, itemId, status),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: userVocabularyQuery(routeVersionId).queryKey,
      }),
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
  const visibleGrammarItems = useMemo(
    () =>
      vocabulary.data?.grammarItems.filter(
        (item) =>
          matchesGrammarSearch(item, search) &&
          matchesVocabularyFilter(item, filter),
      ) ?? [],
    [filter, search, vocabulary.data?.grammarItems],
  )

  if (course.isPending || vocabulary.isPending) return <PageState loading />
  if (course.isError || vocabulary.isError) {
    return <PageState message={(course.error ?? vocabulary.error)?.message} />
  }

  const firstLessonId = course.data.route?.lessons[0]?.id
  const activeCounts =
    section === 'words' ? vocabulary.data.counts : vocabulary.data.grammarCounts
  const hasItems = activeCounts.all > 0
  const visibleCount =
    section === 'words' ? visibleItems.length : visibleGrammarItems.length

  return (
    <PageShell>
      <LearningPageHeader
        eyebrow="Слова, грамматика и повторение"
        title="Мои знания"
        description={`${formatWordCount(vocabulary.data.counts.all)} · ${formatGrammarCount(vocabulary.data.grammarCounts.all)} · ${formatDueCount(vocabulary.data.dueCount)}`}
        aside={
          vocabulary.data.dueCount > 0 ? (
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

      <section
        className="mt-5 grid gap-3 sm:flex sm:items-center sm:justify-between"
        aria-label="Навигация и поиск по словарю"
      >
        <nav
          className="flex w-full rounded-lg bg-muted p-1 sm:w-fit sm:shrink-0"
          aria-label="Раздел словаря"
        >
          <Button
            className="min-w-0 flex-1 sm:flex-none"
            size="sm"
            variant={section === 'words' ? 'secondary' : 'ghost'}
            aria-current={section === 'words' ? 'page' : undefined}
            onClick={() => {
              void navigate({
                replace: true,
                search: (current) => ({ ...current, section: undefined }),
              })
            }}
          >
            <LanguagesIcon /> Слова
            <span className="tabular-nums text-muted-foreground">
              {vocabulary.data.counts.all}
            </span>
          </Button>
          <Button
            className="min-w-0 flex-1 sm:flex-none"
            size="sm"
            variant={section === 'grammar' ? 'secondary' : 'ghost'}
            aria-current={section === 'grammar' ? 'page' : undefined}
            onClick={() => {
              void navigate({
                replace: true,
                search: (current) => ({ ...current, section: 'grammar' }),
              })
            }}
          >
            <BookOpenIcon /> Грамматика
            <span className="tabular-nums text-muted-foreground">
              {vocabulary.data.grammarCounts.all}
            </span>
          </Button>
        </nav>

        <div className="relative w-full sm:max-w-md">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label={
              section === 'words'
                ? 'Поиск по слову или переводу'
                : 'Поиск по грамматике'
            }
            className="pl-9"
            placeholder={
              section === 'words' ? 'Слово или перевод' : 'Конструкция или тема'
            }
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
      </section>

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
              {activeCounts[item.id]}
            </span>
          </Button>
        ))}
      </div>

      {!hasItems ? (
        <section className="motion-feedback mt-6 rounded-lg bg-muted/25 p-5">
          <BookOpenIcon className="size-5 text-primary" />
          <h2 className="mt-3 text-sm font-semibold">
            {section === 'words'
              ? 'Список слов пока пуст'
              : 'Список грамматики пока пуст'}
          </h2>
          <p className="mt-1 max-w-lg text-sm leading-6 text-muted-foreground">
            {section === 'words'
              ? 'Здесь появятся слова, которые ты начал учить в уроках или добавил во время чтения.'
              : 'Здесь появятся грамматические конструкции и навыки, встреченные в практике. Ошибка автоматически добавит нужную тему в повторение.'}
          </p>
          {firstLessonId && section === 'words' ? (
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
      ) : visibleCount === 0 ? (
        <section className="motion-feedback mt-6 rounded-lg bg-muted/25 p-5">
          <h2 className="text-sm font-semibold">Ничего не найдено</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Измени запрос или выбери другой фильтр.
          </p>
        </section>
      ) : section === 'words' ? (
        <VocabularyList
          items={visibleItems}
          changingItemId={
            statusChange.isPending ? statusChange.variables?.itemId : undefined
          }
          statusErrorItemId={
            statusChange.isError ? statusChange.variables?.itemId : undefined
          }
          onStatusChange={(itemId, status) =>
            statusChange.mutate({ itemId, status })
          }
        />
      ) : (
        <GrammarList items={visibleGrammarItems} />
      )}
    </PageShell>
  )
}

function isVocabularyFilter(value: unknown): value is VocabularyFilter {
  return filters.some((filter) => filter.id === value)
}

function isVocabularySection(value: unknown): value is VocabularySection {
  return value === 'words' || value === 'grammar'
}

function VocabularyList({
  items,
  changingItemId,
  statusErrorItemId,
  onStatusChange,
}: {
  items: UserVocabularyItemResponse[]
  changingItemId?: string
  statusErrorItemId?: string
  onStatusChange: (itemId: string, status: WordMemoryStatus) => void
}) {
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
    <section className="mt-5 overflow-hidden rounded-lg bg-card shadow-xs">
      <div className="hidden grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto_1.25rem] gap-5 bg-muted/35 px-4 py-2 text-xs font-medium text-muted-foreground sm:grid">
        <span>Слово</span>
        <span>Перевод</span>
        <span>Статус</span>
        <span className="sr-only">Раскрыть</span>
      </div>
      <ul className="grid gap-0.5 p-1">
        {items.map((item) => {
          const expanded = expandedItems.has(item.itemId)
          const detailsId = `vocabulary-details-${item.itemId.replaceAll('.', '-')}`

          return (
            <li
              key={item.itemId}
              className={cn(
                'overflow-hidden rounded-md',
                expanded && 'ring-1 ring-border/70',
              )}
            >
              <button
                type="button"
                aria-controls={detailsId}
                aria-expanded={expanded}
                className={cn(
                  'interactive-row grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto_1.25rem] sm:gap-5',
                  expanded && 'bg-foreground/[0.025]',
                )}
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
                <VocabularyDetails
                  id={detailsId}
                  item={item}
                  changingStatus={changingItemId === item.itemId}
                  statusError={statusErrorItemId === item.itemId}
                  onStatusChange={(status) =>
                    onStatusChange(item.itemId, status)
                  }
                />
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

const grammarKindLabels: Record<UserGrammarItemResponse['kind'], string> = {
  GRAMMAR: 'Грамматика',
  SPECIFIC_SKILL: 'Навык',
  REGISTER: 'Регистр',
}

function GrammarList({ items }: { items: UserGrammarItemResponse[] }) {
  return (
    <section className="mt-5 overflow-hidden rounded-lg bg-card shadow-xs">
      <div className="hidden grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] gap-5 bg-muted/35 px-4 py-2 text-xs font-medium text-muted-foreground sm:grid">
        <span>Конструкция</span>
        <span>Что нужно знать</span>
        <span>Статус</span>
      </div>
      <ul className="grid gap-0.5 p-1">
        {items.map((item) => (
          <li
            key={item.itemId}
            className="interactive-row grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md px-3 py-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] sm:gap-5"
          >
            <div className="min-w-0">
              <h2 className="text-sm font-semibold sm:text-base">
                {localizedText(item.name)}
              </h2>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {grammarKindLabels[item.kind]} ·{' '}
                {localizedText(item.introducedIn.title)}
              </p>
            </div>
            <p className="text-sm leading-6 text-muted-foreground max-sm:col-span-2 max-sm:row-start-2">
              {item.description
                ? localizedText(item.description)
                : 'Описание появится в материале урока.'}
            </p>
            <span className="flex items-center justify-end">
              <Badge
                className={stateClasses[item.memory.state]}
                variant="outline"
              >
                {stateLabels[item.memory.state]}
              </Badge>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function VocabularyDetails({
  id,
  item,
  changingStatus,
  statusError,
  onStatusChange,
}: {
  id: string
  item: UserVocabularyItemResponse
  changingStatus: boolean
  statusError: boolean
  onStatusChange: (status: WordMemoryStatus) => void
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
  const memoryStatus = toWordMemoryStatus(item.memory.state)

  return (
    <div
      id={id}
      className="motion-feedback border-t border-border/70 bg-card px-4 py-5 sm:px-6 sm:py-6"
    >
      <section aria-label="Сведения о слове">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge
                className="border-border/70 bg-transparent text-foreground"
                variant="outline"
              >
                {morphology.partOfSpeechLabel}
              </Badge>
              {morphology.typeLabel ? (
                <Badge
                  className="border-border/70 bg-transparent text-foreground"
                  variant="outline"
                >
                  {morphology.typeLabel}
                </Badge>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Впервые встретилось: {localizedText(item.introducedIn.title)}
            </p>
          </div>

          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <label className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Статус
              </span>
              <select
                aria-label={`Статус слова ${item.lemma}`}
                aria-busy={changingStatus}
                aria-invalid={statusError}
                className="h-8 min-w-32 rounded-md border bg-card px-2.5 text-sm outline-none transition-shadow focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
                disabled={changingStatus}
                value={memoryStatus}
                onChange={(event) =>
                  onStatusChange(event.target.value as WordMemoryStatus)
                }
              >
                <option value="NEW">Новое</option>
                <option value="LEARNING">Изучается</option>
                <option value="KNOWN">Выучено</option>
              </select>
            </label>
            {statusError ? (
              <p className="text-xs text-destructive" role="alert">
                Не удалось сохранить.
              </p>
            ) : null}
          </div>
        </div>

        {morphology.change ||
        morphology.stems.length > 0 ||
        morphology.gradation ? (
          <div className="mt-4 rounded-lg border border-border/70 bg-foreground/[0.025] p-4">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Как меняется слово
            </p>

            {morphology.change ? (
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <p className="text-base font-semibold">
                  {item.lemma}
                  <span className="mx-2 font-normal text-muted-foreground">
                    →
                  </span>
                  {morphology.change.surface}
                </p>
                {morphology.change.ending ? (
                  <code className="rounded-md border border-primary/15 bg-primary/5 px-2 py-1 text-xs text-foreground">
                    {morphology.change.stem}
                    <span className="mx-1 text-muted-foreground">+</span>
                    <span className="font-semibold text-primary">
                      {morphology.change.ending}
                    </span>
                  </code>
                ) : null}
              </div>
            ) : null}

            {morphology.stems.length > 0 || morphology.gradation ? (
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                {morphology.stems.length > 0 ? (
                  <div>
                    <dt className="text-xs text-muted-foreground">Основа</dt>
                    <dd className="mt-0.5 font-semibold">
                      {morphology.stems.map((stem) => `${stem}-`).join(' / ')}
                    </dd>
                  </div>
                ) : null}
                {morphology.gradation ? (
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Чередование согласных
                    </dt>
                    <dd className="mt-0.5 font-semibold">
                      {morphology.gradation.from} → {morphology.gradation.to}
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </div>
        ) : null}

        {item.example ? (
          <div className="mt-4 border-l-2 border-primary/30 pl-3">
            <p className="text-sm font-medium">{item.example.target}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {localizedText(item.example.source)}
            </p>
          </div>
        ) : null}
      </section>

      <section
        className="mt-6 border-t border-border/70 pt-5"
        aria-label="Основные формы слова"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold">Ключевые формы</h4>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Формы, которые пригодятся чаще всего
            </p>
          </div>
          <Button
            aria-expanded={showAllForms}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => setShowAllForms((current) => !current)}
          >
            {showAllForms ? 'Скрыть все' : `Все формы · ${allForms.length}`}
            <ChevronDownIcon
              className={cn(
                'transition-transform duration-200',
                showAllForms && 'rotate-180',
              )}
            />
          </Button>
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {morphology.keyForms.map(({ form, label }) => (
            <li
              key={form.id}
              className="min-w-0 rounded-lg border border-border/70 bg-foreground/[0.025] px-3.5 py-3"
            >
              <span className="block min-w-0 text-xs leading-4 text-muted-foreground">
                {label}
              </span>
              <span className="mt-1 flex items-center justify-between gap-2">
                <span className="truncate text-base font-semibold">
                  {form.surface}
                </span>
                <AudioButton compact label={form.surface} src={form.audioUrl} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      {showAllForms ? (
        <section
          className="motion-feedback mt-5 border-t border-border/70 pt-5"
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
                    className="h-9 min-w-32 rounded-md border bg-card px-2.5 text-sm outline-none transition-shadow focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                  className="rounded-md border border-border/70 bg-card px-3 py-2"
                >
                  <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    {form.surface}
                    <AudioButton
                      compact
                      label={form.surface}
                      src={form.audioUrl}
                    />
                  </span>
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

function toWordMemoryStatus(state: ReviewMemoryState): WordMemoryStatus {
  if (state === 'NEW') return 'NEW'
  if (state === 'REVIEW') return 'KNOWN'
  return 'LEARNING'
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

function formatGrammarCount(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100
  const ending =
    mod10 === 1 && mod100 !== 11
      ? 'конструкция'
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? 'конструкции'
        : 'конструкций'
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
