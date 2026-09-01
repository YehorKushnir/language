import type {
  LessonVocabularyAnswerResponse,
  LessonVocabularyItemResponse,
} from '@language/contracts'
import { normalizeExactAnswer } from '@language/domain'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  CheckIcon,
  CircleXIcon,
} from 'lucide-react'
import { type FormEvent, useEffect, useRef, useState } from 'react'

import {
  encounterVocabularyItem,
  submitVocabularyAnswer,
} from '@/api/language-api'
import {
  courseProgressQuery,
  courseQuery,
  lessonQuery,
  lessonVocabularyQuery,
  userVocabularyQuery,
  vocabularyStudySessionQuery,
} from '@/api/queries'
import { preloadCourseRoute } from '@/api/route-preload'
import { AudioButton } from '@/components/audio-button'
import { LessonWorkspaceHeader } from '@/components/lesson-workspace-header'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { type AudioPlayback, playAudio } from '@/lib/audio-playback'
import { localizedText } from '@/lib/localized-text'
import {
  appendVocabularyAnswer,
  getNextVocabularyItemId,
} from '@/lib/vocabulary-study-session'

export const Route = createFileRoute('/lessons/$lessonId_/vocabulary')({
  loader: ({ context, params }) =>
    Promise.all([
      preloadCourseRoute(context.queryClient, (routeVersionId, queryClient) =>
        queryClient.ensureQueryData(
          vocabularyStudySessionQuery(params.lessonId, routeVersionId),
        ),
      ),
      context.queryClient.ensureQueryData(lessonQuery(params.lessonId)),
      context.queryClient.ensureQueryData(
        lessonVocabularyQuery(params.lessonId),
      ),
    ]),
  component: LessonVocabularyPage,
})

function LessonVocabularyPage() {
  const { lessonId } = Route.useParams()
  const queryClient = useQueryClient()
  const answerInput = useRef<HTMLInputElement>(null)
  const automaticPlayback = useRef<AudioPlayback | null>(null)
  const idempotencyKey = useRef(crypto.randomUUID())
  const continueAfterSave = useRef(false)
  const encounteredItemIds = useRef(new Set<string>())
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')
  const [localFeedback, setLocalFeedback] =
    useState<LessonVocabularyAnswerResponse | null>(null)
  const [gaveUp, setGaveUp] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const lesson = useQuery(lessonQuery(lessonId))
  const vocabulary = useQuery(lessonVocabularyQuery(lessonId))
  const course = useQuery(courseQuery)
  const routeVersionId = course.data?.route?.id ?? ''
  const session = useQuery({
    ...vocabularyStudySessionQuery(lessonId, routeVersionId),
    enabled: Boolean(routeVersionId),
  })
  const study = useMutation({
    mutationFn: ({
      itemId,
      value,
      requestId,
      gaveUp,
    }: {
      itemId: string
      value: string
      requestId: string
      gaveUp: boolean
    }) =>
      submitVocabularyAnswer(routeVersionId, lessonId, itemId, {
        answer: value,
        idempotencyKey: requestId,
        gaveUp,
      }),
    onSuccess: (result) => {
      setLocalFeedback(result)
      queryClient.setQueryData(
        vocabularyStudySessionQuery(lessonId, routeVersionId).queryKey,
        result.session,
      )
      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: courseProgressQuery(routeVersionId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: userVocabularyQuery(routeVersionId).queryKey,
        }),
      ])
      if (continueAfterSave.current) {
        continueAfterSave.current = false
        continueStudy(result)
      }
    },
    onError: () => {
      continueAfterSave.current = false
    },
  })

  useEffect(() => {
    if (!session.data || !vocabulary.data) return
    if (localFeedback) return
    const activeProgress = session.data.items.find(
      (item) => item.itemId === activeItemId,
    )
    if (
      activeItemId &&
      activeProgress &&
      activeProgress.correctAnswers < session.data.requiredCorrectAnswers
    ) {
      return
    }
    setActiveItemId(
      getNextVocabularyItemId(
        vocabulary.data.items.map((item) => item.itemId),
        session.data,
      ),
    )
  }, [activeItemId, localFeedback, session.data, vocabulary.data])

  useEffect(() => {
    const itemId = activeItemId ?? vocabulary.data?.items[0]?.itemId ?? null
    if (
      !itemId ||
      !routeVersionId ||
      lesson.isPending ||
      vocabulary.isPending ||
      course.isPending ||
      session.isPending ||
      lesson.isError ||
      vocabulary.isError ||
      course.isError ||
      session.isError ||
      encounteredItemIds.current.has(itemId)
    ) {
      return
    }

    encounteredItemIds.current.add(itemId)
    void encounterVocabularyItem(routeVersionId, lessonId, itemId)
      .then(() =>
        Promise.all([
          queryClient.invalidateQueries({
            queryKey: userVocabularyQuery(routeVersionId).queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: courseProgressQuery(routeVersionId).queryKey,
          }),
        ]),
      )
      .catch(() => encounteredItemIds.current.delete(itemId))
  }, [
    activeItemId,
    course.isPending,
    course.isError,
    lesson.isError,
    lesson.isPending,
    lessonId,
    queryClient,
    routeVersionId,
    session.isPending,
    session.isError,
    vocabulary.data,
    vocabulary.isError,
    vocabulary.isPending,
  ])

  useEffect(() => {
    if (!localFeedback) answerInput.current?.focus()
  }, [activeItemId, localFeedback])

  useEffect(
    () => () => {
      automaticPlayback.current?.stop()
    },
    [],
  )

  if (
    lesson.isPending ||
    vocabulary.isPending ||
    course.isPending ||
    session.isPending
  ) {
    return <PartPageState loading />
  }
  if (
    lesson.isError ||
    vocabulary.isError ||
    course.isError ||
    session.isError
  ) {
    return (
      <PartPageState
        message={
          (lesson.error ?? vocabulary.error ?? course.error ?? session.error)
            ?.message
        }
      />
    )
  }

  const items = vocabulary.data.items
  if (items.length === 0) {
    return <PartPageState message="В этом уроке пока нет слов." />
  }
  const feedback =
    localFeedback?.itemId === activeItemId ? localFeedback : undefined
  const currentSession = session.data
  const displaySession = feedback?.session ?? currentSession
  const sessionCompleted =
    displaySession.totalItems > 0 &&
    displaySession.completedItems === displaySession.totalItems
  const shouldShowSummary = sessionCompleted && (!feedback || showSummary)

  if (shouldShowSummary) {
    return (
      <VocabularySummary
        itemCount={items.length}
        lessonId={lessonId}
        lessonTitle={localizedText(lesson.data.title)}
      />
    )
  }

  const item =
    items.find((candidate) => candidate.itemId === activeItemId) ?? items[0]!
  const itemProgress = displaySession.items.find(
    (progress) => progress.itemId === item.itemId,
  ) ?? {
    itemId: item.itemId,
    correctAnswers: 0,
    attempts: 0,
    completedAt: null,
  }
  const totalRequired =
    displaySession.totalItems * displaySession.requiredCorrectAnswers
  const progress = totalRequired
    ? (displaySession.totalCorrectAnswers / totalRequired) * 100
    : 0

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (feedback) {
      automaticPlayback.current?.stop()
      automaticPlayback.current = null
      if (study.isPending) {
        continueAfterSave.current = true
        return
      }
      if (study.isError) {
        continueAfterSave.current = true
        if (study.variables) study.mutate(study.variables)
      } else {
        continueStudy(feedback)
      }
      return
    }
    submitCurrentAnswer(false)
  }

  function submitCurrentAnswer(nextGaveUp: boolean) {
    if (
      (!nextGaveUp && !answer.trim()) ||
      study.isPending ||
      !routeVersionId ||
      feedback
    ) {
      return
    }
    const isCorrect =
      !nextGaveUp &&
      normalizeExactAnswer(answer) === normalizeExactAnswer(item.lemma)
    const optimistic = appendVocabularyAnswer(
      currentSession,
      item.itemId,
      isCorrect,
      new Date().toISOString(),
    )
    setLocalFeedback({
      itemId: item.itemId,
      isCorrect,
      expectedAnswer: item.lemma,
      ...optimistic,
    })
    setGaveUp(nextGaveUp)
    const audioUrl = getLemmaAudioUrl(item)
    if (audioUrl) automaticPlayback.current = playAudio(audioUrl)
    study.mutate({
      itemId: item.itemId,
      value: answer,
      requestId: idempotencyKey.current,
      gaveUp: nextGaveUp,
    })
  }

  function continueStudy(result: LessonVocabularyAnswerResponse) {
    automaticPlayback.current?.stop()
    automaticPlayback.current = null
    if (
      result.session.totalItems > 0 &&
      result.session.completedItems === result.session.totalItems
    ) {
      setShowSummary(true)
      return
    }
    const nextItemId = getNextVocabularyItemId(
      items.map((candidate) => candidate.itemId),
      result.session,
      item.itemId,
    )
    setActiveItemId(nextItemId)
    setAnswer('')
    setLocalFeedback(null)
    setGaveUp(false)
    continueAfterSave.current = false
    study.reset()
    idempotencyKey.current = crypto.randomUUID()
  }

  return (
    <PageShell className="py-4 sm:py-10">
      <LessonWorkspaceHeader
        lessonId={lessonId}
        lessonTitle={localizedText(lesson.data.title)}
        activePart="vocabulary"
      />

      <section className="mt-4 sm:mt-7">
        <header className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-xl font-semibold sm:text-2xl">
            Изучено {displaySession.completedItems} из{' '}
            {displaySession.totalItems}
          </h2>
          <span className="text-xs tabular-nums text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </header>
        <Progress
          value={progress}
          className="mt-2 h-1.5"
          aria-label="Прогресс изучения слов"
        />

        <article
          className="mt-4 rounded-xl border border-border/70 bg-card p-4 shadow-xs sm:mt-5 sm:p-7"
          data-item-id={item.itemId}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="font-serif text-2xl font-semibold sm:text-4xl">
                {localizedText(item.gloss)}
              </h3>
              {item.example ? (
                <p className="mt-2 text-sm text-muted-foreground sm:mt-3">
                  {localizedText(item.example.source)}
                </p>
              ) : null}
            </div>
            <AnswerMarkers
              correctAnswers={itemProgress.correctAnswers}
              required={displaySession.requiredCorrectAnswers}
            />
          </div>

          <form className="mt-5 sm:mt-7" onSubmit={submit}>
            <label className="sr-only" htmlFor="vocabulary-answer">
              Слово по-фински
            </label>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_20.5rem]">
              <Input
                ref={answerInput}
                id="vocabulary-answer"
                autoComplete="off"
                className="h-11 text-base"
                placeholder="Слово по-фински"
                readOnly={study.isPending || Boolean(feedback)}
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return
                  event.preventDefault()
                  event.currentTarget.form?.requestSubmit()
                }}
              />
              <div className={feedback ? undefined : 'grid grid-cols-2 gap-2'}>
                {feedback ? (
                  <Button
                    className="h-11 w-full"
                    disabled={study.isPending}
                    type="submit"
                  >
                    {study.isPending
                      ? 'Сохраняем…'
                      : study.isError
                        ? 'Повторить'
                        : sessionCompleted
                          ? 'Завершить'
                          : 'Продолжить'}
                    {!study.isPending && !study.isError ? (
                      <ArrowRightIcon />
                    ) : null}
                  </Button>
                ) : (
                  <>
                    <Button
                      className="h-11"
                      disabled={study.isPending}
                      type="button"
                      variant="outline"
                      onClick={() => submitCurrentAnswer(true)}
                    >
                      Не знаю
                    </Button>
                    <Button
                      className="h-11"
                      disabled={!answer.trim() || study.isPending}
                      type="submit"
                    >
                      Проверить
                    </Button>
                  </>
                )}
              </div>
            </div>
          </form>

          <div className="pt-3" aria-live="polite">
            {feedback ? (
              <>
                <VocabularyFeedback
                  gaveUp={gaveUp}
                  isSaving={study.isPending}
                  item={item}
                  result={feedback}
                />
                {study.isError ? (
                  <div className="mt-2">
                    <QueryError message={study.error.message} />
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </article>
      </section>
    </PageShell>
  )
}

function AnswerMarkers({
  correctAnswers,
  required,
}: {
  correctAnswers: number
  required: number
}) {
  return (
    <span
      role="progressbar"
      aria-label={`Правильных ответов: ${correctAnswers} из ${required}`}
      aria-valuemin={0}
      aria-valuemax={required}
      aria-valuenow={correctAnswers}
      className="mt-0.5 text-[11px] font-medium tabular-nums text-muted-foreground"
      title="Правильные ответы"
    >
      {correctAnswers}/{required}
    </span>
  )
}

function VocabularyFeedback({
  gaveUp,
  isSaving,
  item,
  result,
}: {
  gaveUp: boolean
  isSaving: boolean
  item: LessonVocabularyItemResponse
  result: LessonVocabularyAnswerResponse
}) {
  const audioUrl = getLemmaAudioUrl(item)

  return (
    <div
      className={`motion-feedback rounded-lg px-4 py-3 text-sm ${
        result.isCorrect
          ? 'bg-primary/5 text-primary'
          : 'bg-destructive/5 text-destructive'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {result.isCorrect ? (
          <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
        ) : (
          <CircleXIcon className="mt-0.5 size-4 shrink-0" />
        )}
        <div>
          <p className="font-semibold">
            {result.isCorrect
              ? result.itemProgress.completedAt
                ? 'Слово изучено'
                : `Верно · ${result.itemProgress.correctAnswers} из ${result.session.requiredCorrectAnswers}`
              : gaveUp
                ? isSaving
                  ? 'Добавляем в изучаемое…'
                  : 'Добавлено в изучаемое'
                : 'Пока неверно'}
          </p>
          <p className="mt-1 text-foreground">
            Правильный ответ:{' '}
            <span className="font-serif text-lg font-semibold" lang="fi">
              {result.expectedAnswer}
            </span>
          </p>
          {item.example ? (
            <p className="mt-2 text-muted-foreground">
              <span lang="fi">{item.example.target}</span> —{' '}
              {localizedText(item.example.source)}
            </p>
          ) : null}
          {audioUrl ? (
            <AudioButton
              className="mt-3"
              label="Прослушать слово"
              src={audioUrl}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

function getLemmaAudioUrl(
  item: LessonVocabularyItemResponse | undefined,
): string | null {
  if (!item) return null
  const normalizedLemma = normalizeExactAnswer(item.lemma)
  return (
    item.forms.find(
      (form) =>
        form.audioUrl && normalizeExactAnswer(form.surface) === normalizedLemma,
    )?.audioUrl ?? null
  )
}

function VocabularySummary({
  itemCount,
  lessonId,
  lessonTitle,
}: {
  itemCount: number
  lessonId: string
  lessonTitle: string
}) {
  return (
    <PageShell>
      <LessonWorkspaceHeader
        lessonId={lessonId}
        lessonTitle={lessonTitle}
        activePart="vocabulary"
      />
      <section className="mt-7 rounded-xl border border-border/70 bg-card p-6 text-center shadow-xs sm:p-8">
        <span className="motion-success mx-auto grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
          <CheckIcon className="size-5" />
        </span>
        <h2 className="mt-4 font-serif text-2xl font-semibold">
          Все {itemCount} слов изучены
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Каждое слово вспомнено правильно три раза. Результат сохранён, а слова
          добавлены в интервальное повторение.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/vocabulary">Перейти к словарю</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/lessons/$lessonId/practice" params={{ lessonId }}>
              Практика <ArrowRightIcon />
            </Link>
          </Button>
        </div>
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
