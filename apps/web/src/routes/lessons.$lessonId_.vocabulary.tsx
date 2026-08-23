import type { VocabularyStudyResult } from '@language/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRightIcon,
  CheckIcon,
  EyeIcon,
  LoaderCircleIcon,
  RotateCcwIcon,
} from 'lucide-react'
import { useState } from 'react'

import { completeLessonPart, studyVocabularyItem } from '@/api/language-api'
import {
  courseProgressQuery,
  courseQuery,
  lessonQuery,
  lessonVocabularyQuery,
  reviewQueueQuery,
} from '@/api/queries'
import { LessonWorkspaceHeader } from '@/components/lesson-workspace-header'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { localizedText } from '@/lib/localized-text'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/lessons/$lessonId_/vocabulary')({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(courseQuery),
      context.queryClient.ensureQueryData(lessonQuery(params.lessonId)),
      context.queryClient.ensureQueryData(
        lessonVocabularyQuery(params.lessonId),
      ),
    ]),
  component: LessonVocabularyPage,
})

const featureLabels: Record<string, string> = {
  nominative: 'именительный',
  genitive: 'родительный',
  partitive: 'партитив',
  singular: 'ед. число',
  plural: 'мн. число',
  invariant: 'неизменяемая форма',
}

const partOfSpeechLabels: Record<string, string> = {
  adjective: 'прилагательное',
  adverb: 'наречие',
  noun: 'существительное',
  pronoun: 'местоимение',
  verb: 'глагол',
}

function LessonVocabularyPage() {
  const { lessonId } = Route.useParams()
  const queryClient = useQueryClient()
  const [cardIndex, setCardIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [cardChanging, setCardChanging] = useState(false)
  const [sessionCompleted, setSessionCompleted] = useState(false)
  const lesson = useQuery(lessonQuery(lessonId))
  const vocabulary = useQuery(lessonVocabularyQuery(lessonId))
  const course = useQuery(courseQuery)
  const routeVersionId = course.data?.route?.id ?? ''

  const completion = useMutation({
    mutationFn: () =>
      completeLessonPart(routeVersionId, lessonId, 'vocabulary'),
    onSuccess: (updatedProgress) => {
      queryClient.setQueryData(
        courseProgressQuery(routeVersionId).queryKey,
        updatedProgress,
      )
    },
  })

  const study = useMutation({
    mutationFn: (result: VocabularyStudyResult) => {
      const item = vocabulary.data?.items[cardIndex]
      if (!item) throw new Error('Карточка не найдена')
      return studyVocabularyItem(routeVersionId, lessonId, item.itemId, {
        result,
      })
    },
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: reviewQueueQuery(routeVersionId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: courseProgressQuery(routeVersionId).queryKey,
        }),
      ])
      const isLastCard = cardIndex === (vocabulary.data?.items.length ?? 0) - 1
      if (isLastCard) {
        setSessionCompleted(true)
        completion.mutate()
        return
      }
      setCardChanging(true)
      window.setTimeout(() => {
        setCardIndex((index) => index + 1)
        setRevealed(false)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setCardChanging(false))
        })
      }, 80)
    },
  })

  if (lesson.isPending || vocabulary.isPending || course.isPending) {
    return <PartPageState loading />
  }
  if (lesson.isError || vocabulary.isError || course.isError) {
    return (
      <PartPageState
        message={(lesson.error ?? vocabulary.error ?? course.error)?.message}
      />
    )
  }

  const items = vocabulary.data.items
  const item = items[cardIndex]
  if (!item) {
    return <PartPageState message="В этом уроке пока нет слов." />
  }

  if (sessionCompleted) {
    return (
      <PageShell>
        <LessonWorkspaceHeader
          lessonId={lessonId}
          lessonTitle={localizedText(lesson.data.title)}
          lessonSummary={localizedText(lesson.data.summary)}
          activePart="vocabulary"
        />
        <section className="mt-7 rounded-lg border bg-card p-6 text-center sm:p-8">
          <span className="motion-success mx-auto grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
            <CheckIcon className="size-5" />
          </span>
          <h2 className="mt-4 font-serif text-2xl font-semibold">
            Все {items.length} слов изучены
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Слова добавлены в интервальное повторение. Знакомые вернутся позже,
            сложные — раньше.
          </p>
          {completion.isPending ? (
            <p className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoaderCircleIcon className="size-4 animate-spin" /> Сохраняем
              прогресс…
            </p>
          ) : completion.isError ? (
            <div className="mt-5 text-left">
              <QueryError message={completion.error.message} />
              <Button
                className="mt-3"
                size="sm"
                variant="outline"
                onClick={() => completion.mutate()}
              >
                <RotateCcwIcon /> Сохранить завершение ещё раз
              </Button>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/reviews">Перейти к повторению</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/lessons/$lessonId/practice" params={{ lessonId }}>
                  Практика <ArrowRightIcon />
                </Link>
              </Button>
            </div>
          )}
        </section>
      </PageShell>
    )
  }

  const progress = ((cardIndex + (revealed ? 0.5 : 0)) / items.length) * 100

  return (
    <PageShell>
      <LessonWorkspaceHeader
        lessonId={lessonId}
        lessonTitle={localizedText(lesson.data.title)}
        lessonSummary={localizedText(lesson.data.summary)}
        activePart="vocabulary"
      />

      <section className="mt-7">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Flashcards
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold">
              Карточка {cardIndex + 1} из {items.length}
            </h2>
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </header>
        <Progress
          value={progress}
          className="mt-3 h-1.5"
          aria-label="Прогресс изучения слов"
        />

        <div className="relative mt-5">
          <span
            aria-hidden="true"
            data-slot="flashcard-transition-cover"
            className={cn(
              'pointer-events-none absolute inset-0 z-10 rounded-lg border bg-card transition-opacity ease-out',
              cardChanging
                ? 'opacity-100 duration-0'
                : 'opacity-0 duration-150',
            )}
          />
          <button
            type="button"
            aria-label={revealed ? 'Перевод открыт' : 'Показать перевод'}
            className="interactive-surface relative block min-h-60 w-full overflow-hidden rounded-xl border bg-card text-left shadow-xs"
            disabled={revealed || study.isPending || cardChanging}
            onClick={() => setRevealed(true)}
          >
            <span
              aria-hidden={revealed}
              data-slot="flashcard-front"
              className={cn(
                'absolute inset-0 flex flex-col items-center justify-center p-6 text-center',
                cardChanging
                  ? 'pointer-events-none translate-y-0 opacity-0 transition-none'
                  : revealed
                    ? 'pointer-events-none -translate-y-2 opacity-0 transition-[opacity,transform] duration-200 ease-out'
                    : 'translate-y-0 opacity-100 transition-[opacity,transform] duration-200 ease-out',
              )}
            >
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {partOfSpeechLabels[item.partOfSpeech] ?? item.partOfSpeech}
              </span>
              <span className="mt-3 font-serif text-4xl font-semibold tracking-tight">
                {item.lemma}
              </span>
              <span className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground">
                <EyeIcon className="size-3.5" /> Нажми, чтобы увидеть перевод
              </span>
            </span>

            <span
              aria-hidden={!revealed}
              data-slot="flashcard-back"
              className={cn(
                'absolute inset-0 flex flex-col overflow-y-auto p-6',
                cardChanging
                  ? 'pointer-events-none translate-y-2 opacity-0 transition-none'
                  : revealed
                    ? 'translate-y-0 opacity-100 transition-[opacity,transform] duration-200 ease-out'
                    : 'pointer-events-none translate-y-2 opacity-0 transition-[opacity,transform] duration-200 ease-out',
              )}
            >
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {item.lemma}
              </span>
              <span className="mt-2 font-serif text-3xl font-semibold">
                {localizedText(item.gloss)}
              </span>
              {item.example ? (
                <span className="mt-4 border-l-2 border-primary/30 pl-3 text-left">
                  <span className="block text-sm font-medium">
                    {item.example.target}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {localizedText(item.example.source)}
                  </span>
                </span>
              ) : null}
              <span className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Формы
              </span>
              <span className="mt-2 flex flex-wrap gap-2">
                {item.forms.map((form) => {
                  const labels = Object.values(form.features).map(
                    (feature) =>
                      featureLabels[String(feature)] ?? String(feature),
                  )
                  return (
                    <span
                      key={form.id}
                      className="rounded-md border bg-muted/30 px-2.5 py-1.5"
                    >
                      <span className="text-sm font-semibold">
                        {form.surface}
                      </span>
                      {labels.length ? (
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          {labels.join(' · ')}
                        </span>
                      ) : null}
                    </span>
                  )
                })}
              </span>
            </span>
          </button>
        </div>

        {study.isError ? (
          <div className="mt-4">
            <QueryError message={study.error.message} />
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            disabled={
              !revealed || study.isPending || cardChanging || !routeVersionId
            }
            aria-busy={study.isPending}
            onClick={() => study.mutate('FAILURE')}
          >
            Ещё раз
          </Button>
          <Button
            disabled={
              !revealed || study.isPending || cardChanging || !routeVersionId
            }
            aria-busy={study.isPending}
            onClick={() => study.mutate('SUCCESS')}
          >
            Знаю
          </Button>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          «Ещё раз» вернёт слово через 10 минут, «Знаю» — через день.
        </p>
      </section>
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
