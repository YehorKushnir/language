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
import { useRef, useState } from 'react'

import { submitExerciseAttempt } from '@/api/language-api'
import {
  courseProgressQuery,
  courseQuery,
  nextReviewQuery,
  reviewQueueQuery,
} from '@/api/queries'
import { preloadCourseRoute } from '@/api/route-preload'
import { PageShell } from '@/components/page-shell'
import { ExerciseReport } from '@/components/exercise-report'
import { PageLoading, QueryError } from '@/components/query-state'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
          queryKey: reviewQueueQuery(routeVersionId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: courseProgressQuery(routeVersionId).queryKey,
        }),
      ])
    },
  })

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
  const result = attempt.data
  const exerciseCompleted = Boolean(result?.isCorrect)
  const total = initialDueCount.current
  const completed = completedExerciseIds.length + (exerciseCompleted ? 1 : 0)
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
    setAnswer('')
    attempt.reset()
    idempotencyKey.current = crypto.randomUUID()
    openedAt.current = Date.now()
  }

  if (!exercise) {
    const hasUnavailableItems = review.data.dueCount > 0
    return (
      <PageShell className="py-14">
        <Button asChild variant="ghost" size="sm" className="-ml-3 mb-8">
          <Link to="/reviews">
            <ArrowLeftIcon /> К очереди
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
                : completedExerciseIds.length > 0
                  ? 'Повторение завершено'
                  : 'На сегодня всё'}
            </h1>
            <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
              {hasUnavailableItems
                ? `Для ${review.data.dueCount} просроченных навыков пока нет подходящего упражнения.`
                : 'Новых просроченных навыков нет. Следующая дата уже сохранена в расписании.'}
            </p>
            <Button asChild className="mt-7">
              <Link to="/reviews">Вернуться к расписанию</Link>
            </Button>
          </CardContent>
        </Card>
      </PageShell>
    )
  }

  return (
    <PageShell className="sm:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-8">
        <Link to="/reviews">
          <ArrowLeftIcon /> Завершить сессию
        </Link>
      </Button>
      <header>
        <Badge variant="secondary">
          <BrainIcon /> Повторение · {completedExerciseIds.length + 1} из{' '}
          {Math.max(total, 1)}
        </Badge>
        <h1 className="mt-5 font-serif text-4xl tracking-tight sm:text-5xl">
          Вспомни конструкцию
        </h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          Задание выбрано по навыку, срок повторения которого уже наступил.
        </p>
        <Progress
          className="mt-7 h-2"
          value={progress}
          aria-label="Прогресс повторения"
        />
      </header>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <Badge variant="outline">Перевод на финский</Badge>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {exercise.targetLanguage}
            </span>
          </div>
          <CardTitle className="pt-4 font-serif text-2xl leading-snug sm:text-3xl">
            {exercise.prompt}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit}>
            <label htmlFor="review-answer" className="text-sm font-medium">
              Твой ответ
            </label>
            <Input
              id="review-answer"
              autoComplete="off"
              autoFocus
              className="mt-2 h-12 text-base"
              placeholder="Напиши фразу по-фински"
              value={answer}
              disabled={attempt.isPending || exerciseCompleted}
              onChange={(event) => setAnswer(event.target.value)}
            />
            <Button
              className="mt-4 w-full sm:w-auto"
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
          </form>
        </CardContent>
      </Card>

      {result ? (
        <Alert
          className="mt-5"
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
          className="mt-3"
          exerciseId={exercise.id}
          attemptId={result.attemptId}
        />
      ) : null}

      {attempt.isError ? (
        <div className="mt-5">
          <QueryError message={attempt.error.message} />
        </div>
      ) : null}

      {result && !result.isCorrect ? (
        <Button className="mt-5" variant="outline" onClick={retry}>
          <RotateCcwIcon /> Попробовать снова
        </Button>
      ) : null}

      {exerciseCompleted ? (
        <div className="mt-7 flex justify-end">
          <Button onClick={nextExercise}>
            Продолжить <ArrowRightIcon />
          </Button>
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
