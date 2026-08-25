import type { PreparedReviewFlashcardResponse } from '@language/contracts'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BrainIcon,
  CheckCircle2Icon,
  LoaderCircleIcon,
  RotateCcwIcon,
  SendIcon,
  XCircleIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { reviewVocabularyItem, submitExerciseAttempt } from '@/api/language-api'
import {
  courseProgressQuery,
  courseQuery,
  nextReviewQuery,
  userVocabularyQuery,
} from '@/api/queries'
import { preloadCourseRoute } from '@/api/route-preload'
import { PageShell } from '@/components/page-shell'
import { ExerciseReport } from '@/components/exercise-report'
import { PageLoading, QueryError } from '@/components/query-state'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { localizedText } from '@/lib/localized-text'

export const Route = createFileRoute('/reviews_/session')({
  loader: ({ context }) =>
    preloadCourseRoute(context.queryClient, (routeVersionId, queryClient) =>
      queryClient.ensureQueryData(nextReviewQuery(routeVersionId)),
    ),
  component: ReviewSessionPage,
})

function ReviewSessionPage() {
  const queryClient = useQueryClient()
  const course = useQuery(courseQuery)
  const routeVersionId = course.data?.route?.id ?? ''
  const [answer, setAnswer] = useState('')
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([])
  const [completedItemCount, setCompletedItemCount] = useState(0)
  const [flashcardRevealed, setFlashcardRevealed] = useState(false)
  const answerInput = useRef<HTMLInputElement>(null)
  const initialDueCount = useRef<number | null>(null)
  const idempotencyKey = useRef(crypto.randomUUID())
  const openedAt = useRef(Date.now())
  const review = useQuery({
    ...nextReviewQuery(routeVersionId, completedExerciseIds),
    enabled: Boolean(routeVersionId),
  })
  const attempt = useMutation({
    mutationFn: async () => {
      const exercise = review.data?.exercise
      if (!exercise) {
        throw new Error('Упражнение для повторения ещё не загружено')
      }

      return submitExerciseAttempt(exercise.id, {
        answer,
        idempotencyKey: idempotencyKey.current,
        routeVersionId,
        durationMs: Date.now() - openedAt.current,
      })
    },
    onSuccess: async () => {
      idempotencyKey.current = crypto.randomUUID()
      openedAt.current = Date.now()
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: courseProgressQuery(routeVersionId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: userVocabularyQuery(routeVersionId).queryKey,
        }),
      ])
    },
  })
  const flashcardReview = useMutation({
    mutationFn: (result: 'SUCCESS' | 'FAILURE') => {
      const flashcard = review.data?.flashcard
      if (!flashcard) throw new Error('Карточка для повторения не загружена')
      return reviewVocabularyItem(routeVersionId, flashcard.itemId, { result })
    },
    onSuccess: async () => {
      await Promise.all([
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
    if (!attempt.data && !review.isFetching) answerInput.current?.focus()
  }, [attempt.data, review.data?.exercise?.id, review.isFetching])

  if (course.isPending || review.isPending) {
    return <PageState loading />
  }

  if (course.isError || review.isError) {
    return <PageState message={(course.error ?? review.error)?.message} />
  }

  if (initialDueCount.current === null) {
    initialDueCount.current = review.data.dueCount
  }

  const exercise = review.data.exercise
  const flashcard = review.data.flashcard
  const result = attempt.data
  const exerciseCompleted = Boolean(result?.isCorrect)
  const total = initialDueCount.current
  const completed =
    completedItemCount +
    (exerciseCompleted ? (exercise?.reviewItemIds.length ?? 1) : 0) +
    (flashcardReview.data ? 1 : 0)
  const progress = total > 0 ? Math.min(100, (completed / total) * 100) : 100

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (
      answer.trim() &&
      exercise &&
      routeVersionId &&
      !attempt.isPending &&
      !exerciseCompleted
    ) {
      attempt.mutate()
    }
  }

  function retry() {
    setAnswer('')
    attempt.reset()
  }

  function nextExercise() {
    if (!exercise) return
    setCompletedExerciseIds((ids) => [...ids, exercise.id])
    setCompletedItemCount(
      (count) => count + Math.max(1, exercise.reviewItemIds.length),
    )
    setAnswer('')
    attempt.reset()
    idempotencyKey.current = crypto.randomUUID()
    openedAt.current = Date.now()
  }

  async function nextFlashcard() {
    setCompletedItemCount((count) => count + 1)
    setFlashcardRevealed(false)
    flashcardReview.reset()
    await review.refetch()
  }

  if (flashcard) {
    return (
      <ReviewFlashcard
        completed={completed}
        error={flashcardReview.error?.message}
        flashcard={flashcard}
        pending={flashcardReview.isPending}
        result={flashcardReview.data ? flashcardReview.variables : undefined}
        revealed={flashcardRevealed}
        total={total}
        onContinue={() => void nextFlashcard()}
        onRate={(rating) => flashcardReview.mutate(rating)}
        onReveal={() => setFlashcardRevealed(true)}
      />
    )
  }

  if (!exercise) {
    const hasUnavailableItems = review.data.dueCount > 0
    return (
      <PageShell className="py-14">
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-8">
          <Link to="/vocabulary">
            <ArrowLeftIcon /> К словарю
          </Link>
        </Button>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-start py-5">
            {hasUnavailableItems ? (
              <XCircleIcon className="size-9 text-destructive" />
            ) : (
              <CheckCircle2Icon className="size-9 text-primary" />
            )}
            <h1 className="mt-5 font-serif text-3xl">
              {hasUnavailableItems
                ? 'Не хватает подготовленного задания'
                : completedExerciseIds.length > 0 || completedItemCount > 0
                  ? 'Повторение завершено'
                  : 'На сегодня всё'}
            </h1>
            <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
              {hasUnavailableItems
                ? `Для ${review.data.dueCount} просроченных навыков пока нет подходящего упражнения.`
                : 'Новых просроченных навыков нет. Следующая дата уже сохранена в расписании.'}
            </p>
            <Button asChild className="mt-7">
              <Link to="/vocabulary">Вернуться к словарю</Link>
            </Button>
          </CardContent>
        </Card>
      </PageShell>
    )
  }

  return (
    <PageShell className="py-4 sm:py-10">
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3 sm:mb-5">
        <Link to="/vocabulary">
          <ArrowLeftIcon /> Завершить сессию
        </Link>
      </Button>
      <header className="border-b pb-3 sm:pb-5">
        <div className="flex items-center justify-between gap-4">
          <Badge variant="secondary">
            <BrainIcon /> Повторение · {Math.min(total, completedItemCount + 1)}{' '}
            из {Math.max(total, 1)}
          </Badge>
          <span className="text-xs tabular-nums text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:mt-3 sm:text-4xl">
          Вспомни конструкцию
        </h1>
        <Progress
          className="mt-3 h-1.5 sm:mt-4"
          value={progress}
          aria-label="Прогресс повторения"
        />
      </header>

      <section className="mt-5 sm:mt-7">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Перевод на финский</span>
          <span>{exercise.targetLanguage}</span>
        </div>
        <h2 className="motion-feedback mt-2 font-serif text-2xl font-semibold leading-snug sm:text-3xl">
          {exercise.prompt.replace(/^Переведи на финский:\s*/u, '')}
        </h2>
        <form className="mt-4 sm:mt-6" onSubmit={submit}>
          <label htmlFor="review-answer" className="sr-only">
            Твой ответ
          </label>
          <div className="grid grid-cols-[minmax(0,1fr)_7.5rem] gap-2 sm:grid-cols-[minmax(0,1fr)_10rem]">
            <Input
              ref={answerInput}
              id="review-answer"
              autoComplete="off"
              className="h-11 text-base"
              placeholder="Напиши фразу по-фински"
              value={answer}
              disabled={attempt.isPending || exerciseCompleted}
              aria-invalid={result ? !result.isCorrect : undefined}
              onChange={(event) => setAnswer(event.target.value)}
            />
            <Button
              className="h-11 w-full"
              type="submit"
              disabled={
                !answer.trim() || attempt.isPending || exerciseCompleted
              }
            >
              {attempt.isPending ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : (
                <SendIcon />
              )}
              Проверить
            </Button>
          </div>
        </form>
      </section>

      {result ? (
        <Alert
          className="motion-feedback mt-5"
          variant={result.isCorrect ? 'default' : 'destructive'}
        >
          {result.isCorrect ? <CheckCircle2Icon /> : <XCircleIcon />}
          <AlertTitle>
            {result.isCorrect ? 'Вспомнил' : 'Нужно закрепить'}
          </AlertTitle>
          <AlertDescription>
            {result.diagnostics.map((diagnostic) => (
              <p key={diagnostic.code}>{localizedText(diagnostic.message)}</p>
            ))}
          </AlertDescription>
        </Alert>
      ) : null}

      {result ? (
        <ExerciseReport
          className="motion-feedback mt-3"
          exerciseId={exercise.id}
          attemptId={result.attemptId}
        />
      ) : null}

      {attempt.isError ? (
        <div className="mt-5">
          <QueryError message={attempt.error.message} />
        </div>
      ) : null}

      {result ? (
        <div className="motion-feedback mt-5 flex justify-end">
          {!result.isCorrect ? (
            <Button autoFocus variant="outline" onClick={retry}>
              <RotateCcwIcon /> Попробовать снова
            </Button>
          ) : null}
          {exerciseCompleted ? (
            <Button autoFocus onClick={nextExercise}>
              Продолжить <ArrowRightIcon />
            </Button>
          ) : null}
        </div>
      ) : null}
    </PageShell>
  )
}

function ReviewFlashcard({
  completed,
  error,
  flashcard,
  pending,
  result,
  revealed,
  total,
  onContinue,
  onRate,
  onReveal,
}: {
  completed: number
  error?: string
  flashcard: PreparedReviewFlashcardResponse
  pending: boolean
  result?: 'SUCCESS' | 'FAILURE'
  revealed: boolean
  total: number
  onContinue: () => void
  onRate: (result: 'SUCCESS' | 'FAILURE') => void
  onReveal: () => void
}) {
  const continueButton = useRef<HTMLButtonElement>(null)
  const progress = total > 0 ? Math.min(100, (completed / total) * 100) : 100

  useEffect(() => {
    if (result) continueButton.current?.focus()
  }, [result])

  return (
    <PageShell className="py-4 sm:py-10">
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-3 sm:mb-5">
        <Link to="/vocabulary">
          <ArrowLeftIcon /> Завершить сессию
        </Link>
      </Button>
      <header className="border-b pb-3 sm:pb-5">
        <div className="flex items-center justify-between gap-4">
          <Badge variant="secondary">
            <BrainIcon /> Повторение · {Math.min(total, completed + 1)} из{' '}
            {Math.max(total, 1)}
          </Badge>
          <span className="text-xs tabular-nums text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:mt-3 sm:text-4xl">
          Вспомни слово
        </h1>
        <Progress
          className="mt-3 h-1.5 sm:mt-4"
          value={progress}
          aria-label="Прогресс повторения"
        />
      </header>

      <section className="mt-5 rounded-xl border bg-card p-5 text-center shadow-xs sm:mt-7 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Финский
        </p>
        <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight">
          {flashcard.lemma}
        </h2>
        {revealed ? (
          <div className="motion-feedback mt-6 border-t pt-6">
            <p className="font-serif text-2xl font-semibold">
              {localizedText(flashcard.gloss)}
            </p>
            {flashcard.example ? (
              <div className="mx-auto mt-4 max-w-lg text-sm leading-6">
                <p className="font-medium">{flashcard.example.target}</p>
                <p className="text-muted-foreground">
                  {localizedText(flashcard.example.source)}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <Button className="mt-8" onClick={onReveal}>
            Показать перевод
          </Button>
        )}
      </section>

      {error ? (
        <div className="mt-4">
          <QueryError message={error} />
        </div>
      ) : null}

      {revealed ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {result ? (
            <Button
              ref={continueButton}
              className="col-span-2"
              onClick={onContinue}
            >
              Продолжить <ArrowRightIcon />
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                disabled={pending}
                onClick={() => onRate('FAILURE')}
              >
                Ещё раз
              </Button>
              <Button disabled={pending} onClick={() => onRate('SUCCESS')}>
                Знаю
              </Button>
            </>
          )}
        </div>
      ) : null}
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
    <PageShell className="py-14">
      {loading ? <PageLoading /> : <QueryError message={message} />}
    </PageShell>
  )
}
