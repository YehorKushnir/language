import type { PreparedTextTokenResponse } from '@language/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowLeftIcon,
  HeadphonesIcon,
  LoaderCircleIcon,
  PlusIcon,
  SquareIcon,
  Volume2Icon,
} from 'lucide-react'
import { Fragment, useEffect, useMemo, useState } from 'react'

import { addVocabularyItem } from '@/api/language-api'
import {
  courseQuery,
  preparedTextQuery,
  preparedTextsQuery,
  reviewQueueQuery,
  userVocabularyQuery,
} from '@/api/queries'
import { preloadCourseRoute } from '@/api/route-preload'
import { LearningPageHeader } from '@/components/learning-page-header'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { localizedText } from '@/lib/localized-text'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/texts_/$textId')({
  loader: ({ context, params }) =>
    preloadCourseRoute(context.queryClient, (routeVersionId, queryClient) =>
      queryClient.ensureQueryData(
        preparedTextQuery(routeVersionId, params.textId),
      ),
    ),
  component: PreparedTextPage,
})

const analysisLabels: Record<string, string> = {
  partOfSpeech: 'Часть речи',
  person: 'Лицо',
  number: 'Число',
  case: 'Падеж',
  polarity: 'Форма',
  mood: 'Тип',
  form: 'Форма',
}

const analysisValues: Record<string, string> = {
  adjective: 'прилагательное',
  adverb: 'наречие',
  affirmative: 'утвердительная',
  conjunction: 'союз',
  connegative: 'основа при отрицании',
  first: '1-е',
  negative: 'отрицательная',
  nominative: 'именительный',
  noun: 'существительное',
  plural: 'множественное',
  pronoun: 'местоимение',
  properNoun: 'имя собственное',
  question: 'вопрос',
  second: '2-е',
  singular: 'единственное',
  third: '3-е',
  unknown: 'не определено',
  verb: 'глагол',
}

function PreparedTextPage() {
  const { textId } = Route.useParams()
  const queryClient = useQueryClient()
  const course = useQuery(courseQuery)
  const routeVersionId = course.data?.route?.id ?? ''
  const text = useQuery({
    ...preparedTextQuery(routeVersionId, textId),
    enabled: Boolean(routeVersionId),
  })
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [speaking, setSpeaking] = useState(false)
  const addWord = useMutation({
    mutationFn: (itemId: string) => addVocabularyItem(routeVersionId, itemId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: preparedTextQuery(routeVersionId, textId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: preparedTextsQuery(routeVersionId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: userVocabularyQuery(routeVersionId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: reviewQueueQuery(routeVersionId).queryKey,
        }),
      ])
    },
  })

  useEffect(
    () => () => {
      window.speechSynthesis?.cancel()
    },
    [],
  )

  const selectedToken = useMemo(
    () =>
      text.data?.tokens.find((token) => token.position === selectedPosition) ??
      null,
    [selectedPosition, text.data?.tokens],
  )

  if (course.isPending || text.isPending) return <PageState loading />
  if (course.isError || text.isError) {
    return <PageState message={(course.error ?? text.error)?.message} />
  }
  const textData = text.data

  function toggleSpeech() {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(textData.body)
    utterance.lang = 'fi-FI'
    utterance.rate = 0.86
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  return (
    <PageShell>
      <LearningPageHeader
        eyebrow={
          <Link
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            to="/texts"
          >
            <ArrowLeftIcon className="size-3.5" /> Все тексты
          </Link>
        }
        title={localizedText(textData.title)}
        description={`${textData.level} · ${textData.wordCount} слов · знакомо ${textData.knownPercent}%`}
        transitionTitle
        aside={
          textData.audioUrl ? (
            <audio className="h-9 w-full" controls src={textData.audioUrl} />
          ) : (
            <div>
              <Button
                className="w-full"
                size="sm"
                variant="outline"
                onClick={toggleSpeech}
              >
                {speaking ? <SquareIcon /> : <Volume2Icon />}
                {speaking ? 'Остановить' : 'Озвучить'}
              </Button>
              <p className="mt-1 text-center text-[11px] text-muted-foreground">
                голос устройства
              </p>
            </div>
          )
        }
      />

      <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_17rem]">
        <article className="rounded-lg border bg-card px-5 py-6 sm:px-7 sm:py-8">
          <p className="whitespace-pre-wrap font-serif text-xl leading-[2.1] sm:text-2xl">
            <InteractiveText
              body={textData.body}
              tokens={textData.tokens}
              selectedPosition={selectedPosition}
              onSelect={setSelectedPosition}
            />
          </p>
          <p className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <HeadphonesIcon className="size-3.5" /> Нажми на слово, чтобы
            увидеть разбор.
          </p>
        </article>

        <WordInspector
          token={selectedToken}
          adding={addWord.isPending}
          error={addWord.error?.message}
          onAdd={(itemId) => addWord.mutate(itemId)}
        />
      </div>
    </PageShell>
  )
}

function InteractiveText({
  body,
  tokens,
  selectedPosition,
  onSelect,
}: {
  body: string
  tokens: PreparedTextTokenResponse[]
  selectedPosition: number | null
  onSelect: (position: number) => void
}) {
  let cursor = 0

  return (
    <>
      {tokens.map((token) => {
        const before = body.slice(cursor, token.charStart)
        cursor = token.charEnd
        return (
          <Fragment key={token.position}>
            {before}
            <button
              type="button"
              className={cn(
                '-mx-0.5 rounded px-0.5 underline decoration-border decoration-1 underline-offset-4 transition-colors hover:bg-accent hover:decoration-primary',
                selectedPosition === token.position &&
                  'bg-accent decoration-primary',
              )}
              onClick={() => onSelect(token.position)}
            >
              {token.surface}
            </button>
          </Fragment>
        )
      })}
      {body.slice(cursor)}
    </>
  )
}

function WordInspector({
  token,
  adding,
  error,
  onAdd,
}: {
  token: PreparedTextTokenResponse | null
  adding: boolean
  error?: string
  onAdd: (itemId: string) => void
}) {
  if (!token) {
    return (
      <aside className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground md:sticky md:top-20 md:self-start">
        Здесь появятся перевод, начальная форма и грамматические признаки
        выбранного слова.
      </aside>
    )
  }

  return (
    <aside className="rounded-lg border bg-card p-4 md:sticky md:top-20 md:self-start">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">{token.surface}</p>
          <p className="text-sm text-muted-foreground">{token.lemma}</p>
        </div>
        {token.lexical ? (
          <Badge variant={token.lexical.memory.dueAt ? 'secondary' : 'outline'}>
            {token.lexical.memory.repetitions > 0
              ? 'Знакомо'
              : token.lexical.memory.dueAt
                ? 'В очереди'
                : 'Новое'}
          </Badge>
        ) : null}
      </div>

      {token.lexical ? (
        <div className="mt-4 border-t pt-3">
          <p className="text-sm font-medium">
            {localizedText(token.lexical.gloss)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {token.lexical.forms.map((form) => form.surface).join(' · ')}
          </p>
          {token.lexical.example ? (
            <div className="mt-3 border-l-2 border-primary/30 pl-3 text-xs">
              <p className="font-medium">{token.lexical.example.target}</p>
              <p className="mt-0.5 text-muted-foreground">
                {localizedText(token.lexical.example.source)}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      <dl className="mt-4 grid gap-2 border-t pt-3">
        {Object.entries(token.analysis).map(([key, value]) => (
          <div key={key} className="grid grid-cols-[6.5rem_1fr] gap-2 text-xs">
            <dt className="text-muted-foreground">
              {analysisLabels[key] ?? key}
            </dt>
            <dd>{analysisValues[value] ?? value}</dd>
          </div>
        ))}
      </dl>
      {token.lexical && !token.lexical.memory.dueAt ? (
        <Button
          className="mt-4 w-full"
          disabled={adding}
          onClick={() => onAdd(token.lexical!.itemId)}
          size="sm"
          variant="outline"
        >
          {adding ? (
            <LoaderCircleIcon className="animate-spin" />
          ) : (
            <PlusIcon />
          )}
          Добавить в изучение
        </Button>
      ) : null}
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </aside>
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
