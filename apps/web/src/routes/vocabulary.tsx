import type {
  ReviewMemoryState,
  UserVocabularyItemResponse,
} from '@language/contracts'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { SearchIcon } from 'lucide-react'
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

export const Route = createFileRoute('/vocabulary')({
  loader: ({ context }) =>
    preloadCourseRoute(context.queryClient, (routeVersionId, queryClient) =>
      queryClient.ensureQueryData(userVocabularyQuery(routeVersionId)),
    ),
  component: VocabularyPage,
})

type VocabularyFilter = 'all' | 'due' | 'new' | 'learning' | 'review'

const filters: Array<{ id: VocabularyFilter; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'due', label: 'Пора повторить' },
  { id: 'new', label: 'Новые' },
  { id: 'learning', label: 'Изучаются' },
  { id: 'review', label: 'Закрепляются' },
]

const stateLabels: Record<ReviewMemoryState, string> = {
  NEW: 'Новое',
  LEARNING: 'Изучается',
  REVIEW: 'Закрепляется',
  RELEARNING: 'Переучивается',
}

const partOfSpeechLabels: Record<string, string> = {
  adjective: 'прилагательное',
  adverb: 'наречие',
  noun: 'существительное',
  pronoun: 'местоимение',
  verb: 'глагол',
}

function VocabularyPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<VocabularyFilter>('all')
  const course = useQuery(courseQuery)
  const routeVersionId = course.data?.route?.id ?? ''
  const vocabulary = useQuery({
    ...userVocabularyQuery(routeVersionId),
    enabled: Boolean(routeVersionId),
  })
  const visibleItems = useMemo(
    () =>
      vocabulary.data?.items.filter(
        (item) => matchesSearch(item, search) && matchesFilter(item, filter),
      ) ?? [],
    [filter, search, vocabulary.data?.items],
  )

  if (course.isPending || vocabulary.isPending) return <PageState loading />
  if (course.isError || vocabulary.isError) {
    return <PageState message={(course.error ?? vocabulary.error)?.message} />
  }

  return (
    <PageShell>
      <LearningPageHeader
        eyebrow="Личная коллекция"
        title="Словарь"
        description={`${vocabulary.data.totalCount} слов · ${vocabulary.data.dueCount} пора повторить`}
        aside={
          <div className="relative w-full">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Поиск по словарю"
              className="pl-9"
              placeholder="Слово или перевод"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        }
      />

      <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Фильтр слов">
        {filters.map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant={filter === item.id ? 'secondary' : 'ghost'}
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {visibleItems.length === 0 ? (
        <section className="motion-feedback mt-6 rounded-lg border border-dashed p-5">
          <h2 className="text-sm font-semibold">Ничего не найдено</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Измени поисковый запрос или выбери другой фильтр.
          </p>
        </section>
      ) : (
        <ul className="mt-5 overflow-hidden rounded-lg border bg-card">
          {visibleItems.map((item) => (
            <VocabularyRow key={item.itemId} item={item} />
          ))}
        </ul>
      )}
    </PageShell>
  )
}

function VocabularyRow({ item }: { item: UserVocabularyItemResponse }) {
  return (
    <li className="interactive-row grid gap-2 border-t px-4 py-3 first:border-t-0 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] sm:items-center sm:gap-5">
      <div className="min-w-0">
        <p className="truncate text-base font-semibold">{item.lemma}</p>
        <p className="text-xs text-muted-foreground">
          {partOfSpeechLabels[item.partOfSpeech] ?? item.partOfSpeech}
        </p>
      </div>
      <div className="min-w-0">
        <p className="text-sm">{localizedText(item.gloss)}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {item.forms.map((form) => form.surface).join(' · ')}
        </p>
        {item.example ? (
          <p className="mt-1 truncate text-xs">
            {item.example.target}{' '}
            <span className="text-muted-foreground">
              — {localizedText(item.example.source)}
            </span>
          </p>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <Button asChild size="sm" variant="ghost">
          {item.introducedIn.kind === 'lesson' ? (
            <Link
              to="/lessons/$lessonId/vocabulary"
              params={{ lessonId: item.introducedIn.lessonId }}
            >
              {localizedText(item.introducedIn.title)}
            </Link>
          ) : (
            <Link
              to="/texts/$textId"
              params={{ textId: item.introducedIn.textId }}
            >
              {localizedText(item.introducedIn.title)}
            </Link>
          )}
        </Button>
        <Badge variant={item.memory.isDue ? 'default' : 'outline'}>
          {item.memory.isDue ? 'Повторить' : stateLabels[item.memory.state]}
        </Badge>
      </div>
    </li>
  )
}

function matchesSearch(item: UserVocabularyItemResponse, search: string) {
  const normalizedSearch = search.trim().toLocaleLowerCase('ru')
  if (!normalizedSearch) return true

  return [
    item.lemma,
    localizedText(item.gloss),
    item.example?.target ?? '',
    item.example ? localizedText(item.example.source) : '',
    ...item.forms.map((form) => form.surface),
  ].some((value) => value.toLocaleLowerCase('ru').includes(normalizedSearch))
}

function matchesFilter(
  item: UserVocabularyItemResponse,
  filter: VocabularyFilter,
) {
  if (filter === 'all') return true
  if (filter === 'due') return item.memory.isDue
  if (filter === 'new') return item.memory.state === 'NEW'
  if (filter === 'review') return item.memory.state === 'REVIEW'
  return ['LEARNING', 'RELEARNING'].includes(item.memory.state)
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
