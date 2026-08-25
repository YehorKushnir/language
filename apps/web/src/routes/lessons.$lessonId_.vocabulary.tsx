import type {
  LessonVocabularyAnswerResponse,
  LessonVocabularyItemResponse,
} from '@language/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  CheckIcon,
  CircleXIcon,
  RotateCcwIcon,
} from 'lucide-react'
import { type FormEvent, useEffect, useRef, useState } from 'react'

import { submitVocabularyAnswer } from '@/api/language-api'
import {
  courseProgressQuery,
  courseQuery,
  lessonQuery,
  lessonVocabularyQuery,
  userVocabularyQuery,
  vocabularyStudySessionQuery,
} from '@/api/queries'
import { LessonWorkspaceHeader } from '@/components/lesson-workspace-header'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { localizedText } from '@/lib/localized-text'
import { getNextVocabularyItemId } from '@/lib/vocabulary-study-session'

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

function LessonVocabularyPage() {
  const { lessonId } = Route.useParams()
  const queryClient = useQueryClient()
  const answerInput = useRef<HTMLInputElement>(null)
  const idempotencyKey = useRef(crypto.randomUUID())
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')
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
    }: {
      itemId: string
      value: string
      requestId: string
    }) =>
      submitVocabularyAnswer(routeVersionId, lessonId, itemId, {
        answer: value,
        idempotencyKey: requestId,
      }),
    onSuccess: (result) => {
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
    },
  })

  useEffect(() => {
    if (!session.data || !vocabulary.data) return
    if (study.data) return
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
  }, [activeItemId, session.data, study.data, vocabulary.data])

  useEffect(() => {
    if (!study.isPending) answerInput.current?.focus()
  }, [activeItemId, study.data, study.isPending])

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
  const sessionCompleted =
    session.data.totalItems > 0 &&
    session.data.completedItems === session.data.totalItems
  const shouldShowSummary = sessionCompleted && (!study.data || showSummary)

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
  const itemProgress = session.data.items.find(
    (progress) => progress.itemId === item.itemId,
  ) ?? {
    itemId: item.itemId,
    correctAnswers: 0,
    attempts: 0,
    completedAt: null,
  }
  const feedback = study.data?.itemId === item.itemId ? study.data : undefined
  const totalRequired =
    session.data.totalItems * session.data.requiredCorrectAnswers
  const progress = totalRequired
    ? (session.data.totalCorrectAnswers / totalRequired) * 100
    : 0

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (feedback) {
      continueStudy(feedback)
      return
    }
    if (!answer.trim() || study.isPending || !routeVersionId) return
    study.mutate({
      itemId: item.itemId,
      value: answer,
      requestId: idempotencyKey.current,
    })
  }

  function continueStudy(result: LessonVocabularyAnswerResponse) {
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
            Изучено {session.data.completedItems} из {session.data.totalItems}
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
          className="mt-4 rounded-xl border bg-card p-4 shadow-xs sm:mt-5 sm:p-7"
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
              required={session.data.requiredCorrectAnswers}
            />
          </div>

          <form className="mt-5 sm:mt-7" onSubmit={submit}>
            <label className="sr-only" htmlFor="vocabulary-answer">
              Слово по-фински
            </label>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem]">
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
              {feedback ? (
                <Button className="h-11" type="submit">
                  {sessionCompleted ? 'Завершить' : 'Продолжить'}
                  <ArrowRightIcon />
                </Button>
              ) : (
                <Button
                  className="h-11"
                  disabled={!answer.trim() || study.isPending}
                  type="submit"
                >
                  {study.isPending ? 'Проверяем…' : 'Проверить'}
                </Button>
              )}
            </div>
          </form>

          <div className="pt-3" aria-live="polite">
            {feedback ? (
              <VocabularyFeedback item={item} result={feedback} />
            ) : study.isError ? (
              <div>
                <QueryError message={study.error.message} />
                <Button
                  className="mt-3"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    study.mutate({
                      itemId: item.itemId,
                      value: answer,
                      requestId: idempotencyKey.current,
                    })
                  }
                >
                  <RotateCcwIcon /> Повторить отправку
                </Button>
              </div>
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
  item,
  result,
}: {
  item: LessonVocabularyItemResponse
  result: LessonVocabularyAnswerResponse
}) {
  return (
    <div
      className={`motion-feedback rounded-lg border px-4 py-3 text-sm ${
        result.isCorrect
          ? 'border-primary/25 bg-primary/5 text-primary'
          : 'border-destructive/25 bg-destructive/5 text-destructive'
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
        </div>
      </div>
    </div>
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
      <section className="mt-7 rounded-xl border bg-card p-6 text-center shadow-xs sm:p-8">
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
