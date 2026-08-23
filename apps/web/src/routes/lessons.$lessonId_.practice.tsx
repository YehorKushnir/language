import type { PracticeCompletionResponse } from '@language/contracts'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { completePractice, submitExerciseAttempt } from '@/api/language-api'
import {
  courseProgressQuery,
  courseQuery,
  lessonQuery,
  nextExerciseQuery,
} from '@/api/queries'
import { LessonWorkspaceHeader } from '@/components/lesson-workspace-header'
import { ExerciseReport } from '@/components/exercise-report'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { localizedText } from '@/lib/localized-text'

export const Route = createFileRoute('/lessons/$lessonId_/practice')({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(courseQuery),
      context.queryClient.ensureQueryData(lessonQuery(params.lessonId)),
    ]),
  component: LessonPracticePage,
})

const SESSION_SIZE = 60

function LessonPracticePage() {
  const { lessonId } = Route.useParams()
  const queryClient = useQueryClient()
  const [answer, setAnswer] = useState('')
  const [round, setRound] = useState(1)
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([])
  const [attemptIds, setAttemptIds] = useState<string[]>([])
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const answerInput = useRef<HTMLInputElement>(null)
  const idempotencyKey = useRef(crypto.randomUUID())
  const openedAt = useRef(Date.now())
  const lesson = useQuery(lessonQuery(lessonId))
  const course = useQuery(courseQuery)
  const routeVersionId = course.data?.route?.id ?? ''
  const exercise = useQuery({
    ...nextExerciseQuery(lessonId, routeVersionId, completedExerciseIds),
    enabled: Boolean(routeVersionId),
  })
  const attempt = useMutation({
    mutationFn: async () => {
      if (!exercise.data) throw new Error('Упражнение ещё не загружено')

      const result = await submitExerciseAttempt(exercise.data.id, {
        answer,
        idempotencyKey: idempotencyKey.current,
        routeVersionId,
        durationMs: Date.now() - openedAt.current,
      })
      const nextAttemptIds = [...attemptIds, result.attemptId]
      const nextCorrectAnswers = correctAnswers + (result.isCorrect ? 1 : 0)
      const completion =
        round === SESSION_SIZE
          ? await completePractice(routeVersionId, lessonId, {
              attemptIds: nextAttemptIds,
            })
          : null

      return {
        result,
        completion,
        nextAttemptIds,
        nextCorrectAnswers,
      }
    },
    onSuccess: ({ completion, nextAttemptIds, nextCorrectAnswers }) => {
      setAttemptIds(nextAttemptIds)
      setCorrectAnswers(nextCorrectAnswers)
      if (completion) {
        queryClient.setQueryData(
          courseProgressQuery(routeVersionId).queryKey,
          completion.progress,
        )
      }
      idempotencyKey.current = crypto.randomUUID()
    },
  })

  useEffect(() => {
    if (!exercise.isFetching && !attempt.data) answerInput.current?.focus()
  }, [attempt.data, exercise.data?.id, exercise.isFetching])

  if (exercise.isPending || lesson.isPending || course.isPending) {
    return <PartPageState loading />
  }

  if (exercise.isError || lesson.isError || course.isError) {
    return (
      <PartPageState
        message={(exercise.error ?? lesson.error ?? course.error)?.message}
      />
    )
  }

  const result = attempt.data?.result
  const completion = attempt.data?.completion
  const activeExerciseId = exercise.data.id
  const isLastQuestion = round === SESSION_SIZE
  const canSubmit = Boolean(
    routeVersionId &&
    !attempt.isPending &&
    !exercise.isFetching &&
    (result || answer.trim()),
  )

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    if (result) {
      if (isLastQuestion) {
        setShowSummary(true)
      } else {
        nextExercise()
      }
      return
    }

    attempt.mutate()
  }

  function restartPractice() {
    setAnswer('')
    setRound(1)
    setCompletedExerciseIds([])
    setAttemptIds([])
    setCorrectAnswers(0)
    setShowSummary(false)
    attempt.reset()
    idempotencyKey.current = crypto.randomUUID()
    openedAt.current = Date.now()
  }

  function nextExercise() {
    setCompletedExerciseIds((ids) => [...ids, activeExerciseId])
    setRound((currentRound) => currentRound + 1)
    setAnswer('')
    attempt.reset()
    idempotencyKey.current = crypto.randomUUID()
    openedAt.current = Date.now()
  }

  const feedback = result
    ? result.isCorrect
      ? 'Верно.'
      : result.diagnostics
          .map((diagnostic) => localizedText(diagnostic.message))
          .join(' ')
    : null
  const prompt = exercise.data.prompt.replace(/^Переведи на финский:\s*/u, '')

  if (showSummary && completion) {
    return (
      <PracticeSummary
        completion={completion}
        lessonId={lessonId}
        lessonTitle={localizedText(lesson.data.title)}
        lessonSummary={localizedText(lesson.data.summary)}
        onRestart={restartPractice}
      />
    )
  }

  return (
    <PageShell>
      <LessonWorkspaceHeader
        lessonId={lessonId}
        lessonTitle={localizedText(lesson.data.title)}
        lessonSummary={localizedText(lesson.data.summary)}
        activePart="practice"
      />

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-wider">
          <p className="text-primary">
            Задание {round} из {SESSION_SIZE}
          </p>
          <p className="text-muted-foreground">
            Верных: {correctAnswers} из {result ? round : round - 1}
          </p>
        </div>
        <Progress
          className="mt-3 h-1.5"
          value={((round - (result ? 0 : 1)) / SESSION_SIZE) * 100}
          aria-label="Прогресс практики"
        />
        <h2
          className={`mt-2 font-serif text-2xl font-semibold leading-snug transition-opacity sm:text-3xl ${
            exercise.isFetching ? 'opacity-40' : ''
          }`}
        >
          {prompt}
        </h2>

        <form className="mt-6" onSubmit={submit}>
          <label htmlFor="answer" className="sr-only">
            Ответ на финском
          </label>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem]">
            <Input
              ref={answerInput}
              id="answer"
              autoComplete="off"
              className="h-11 text-base"
              placeholder="Ответ на финском"
              value={answer}
              readOnly={attempt.isPending || Boolean(result)}
              disabled={exercise.isFetching}
              onChange={(event) => setAnswer(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }}
            />
            <Button
              className="h-11 w-full"
              type="submit"
              disabled={!canSubmit}
              aria-busy={attempt.isPending}
            >
              {result
                ? isLastQuestion
                  ? 'Результаты'
                  : 'Следующий'
                : attempt.isPending
                  ? 'Проверяем…'
                  : 'Проверить'}
            </Button>
          </div>
        </form>

        <div className="min-h-12 pt-3" aria-live="polite">
          {feedback ? (
            <p
              className={`text-sm leading-6 ${
                result?.isCorrect ? 'text-primary' : 'text-destructive'
              }`}
            >
              {feedback}{' '}
              <span className="text-muted-foreground">
                Нажми Enter, чтобы {isLastQuestion ? 'вернуться' : 'продолжить'}
                .
              </span>
            </p>
          ) : null}
          {attempt.isError ? (
            <QueryError message={attempt.error.message} />
          ) : null}
        </div>
        {result ? (
          <ExerciseReport
            className="mt-2"
            exerciseId={activeExerciseId}
            attemptId={result.attemptId}
          />
        ) : null}
      </section>
    </PageShell>
  )
}

function PracticeSummary({
  completion,
  lessonId,
  lessonTitle,
  lessonSummary,
  onRestart,
}: {
  completion: PracticeCompletionResponse
  lessonId: string
  lessonTitle: string
  lessonSummary: string
  onRestart: () => void
}) {
  const requiredPercent =
    (completion.requiredCorrectAnswers / completion.totalExercises) * 100

  return (
    <PageShell>
      <LessonWorkspaceHeader
        lessonId={lessonId}
        lessonTitle={lessonTitle}
        lessonSummary={lessonSummary}
        activePart="practice"
      />
      <section className="mt-8 border-t pt-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Практика завершена
        </p>
        <h2 className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">
          {completion.passed ? 'Урок пройден' : 'Нужно попробовать ещё раз'}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {completion.correctAnswers} правильных ответов из{' '}
          {completion.totalExercises} — {completion.scorePercent}%. Для
          прохождения нужно не меньше {requiredPercent}% (
          {completion.requiredCorrectAnswers} правильных ответов).
        </p>
        <Progress
          className="mt-5 h-2"
          value={completion.scorePercent}
          aria-label="Результат практики"
        />
        <div className="mt-6 flex flex-wrap gap-2">
          {!completion.passed ? (
            <Button size="sm" onClick={onRestart}>
              Пройти ещё раз
            </Button>
          ) : null}
          <Button asChild size="sm" variant="outline">
            <Link to="/lessons">Вернуться к урокам</Link>
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
