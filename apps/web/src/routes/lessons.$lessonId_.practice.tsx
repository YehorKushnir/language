import type {
  PracticeCompletionResponse,
  PracticeSessionResponse,
} from '@language/contracts'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckCircle2Icon, CircleXIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { completePractice, submitExerciseAttempt } from '@/api/language-api'
import {
  courseProgressQuery,
  courseQuery,
  lessonQuery,
  nextExerciseQuery,
  practiceSessionQuery,
} from '@/api/queries'
import { LessonWorkspaceHeader } from '@/components/lesson-workspace-header'
import { ExerciseReport } from '@/components/exercise-report'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { localizedText } from '@/lib/localized-text'
import { appendPracticeAttempt } from '@/lib/practice-session'

export const Route = createFileRoute('/lessons/$lessonId_/practice')({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(courseQuery),
      context.queryClient.ensureQueryData(lessonQuery(params.lessonId)),
    ]),
  component: LessonPracticePage,
})

const SESSION_SIZE = 60
const PRACTICE_BLOCK_SIZE = 10

function LessonPracticePage() {
  const { lessonId } = Route.useParams()
  const queryClient = useQueryClient()
  const [answer, setAnswer] = useState('')
  const [round, setRound] = useState(1)
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([])
  const [attemptIds, setAttemptIds] = useState<string[]>([])
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [showBreak, setShowBreak] = useState(false)
  const [hydratedSessionStartedAt, setHydratedSessionStartedAt] = useState<
    string | null
  >(null)
  const answerInput = useRef<HTMLInputElement>(null)
  const idempotencyKey = useRef(crypto.randomUUID())
  const openedAt = useRef(Date.now())
  const recoveredSessionCompletionStartedAt = useRef<string | null>(null)
  const lesson = useQuery(lessonQuery(lessonId))
  const course = useQuery(courseQuery)
  const routeVersionId = course.data?.route?.id ?? ''
  const practiceSession = useQuery({
    ...practiceSessionQuery(lessonId, routeVersionId),
    enabled: Boolean(routeVersionId),
  })
  const sessionIsHydrated =
    Boolean(practiceSession.data) &&
    hydratedSessionStartedAt === practiceSession.data?.startedAt
  const exercise = useQuery({
    ...nextExerciseQuery(lessonId, routeVersionId, completedExerciseIds),
    enabled: Boolean(
      routeVersionId &&
      sessionIsHydrated &&
      completedExerciseIds.length < SESSION_SIZE,
    ),
  })
  const completion = useMutation({
    mutationFn: (ids: string[]) =>
      completePractice(routeVersionId, lessonId, { attemptIds: ids }),
    onSuccess: (result) => {
      queryClient.setQueryData(
        courseProgressQuery(routeVersionId).queryKey,
        result.progress,
      )
    },
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

      return {
        result,
        nextAttemptIds,
        nextCorrectAnswers,
      }
    },
    onSuccess: ({ result, nextAttemptIds, nextCorrectAnswers }) => {
      setAttemptIds(nextAttemptIds)
      setCorrectAnswers(nextCorrectAnswers)
      if (exercise.data) {
        queryClient.setQueryData<PracticeSessionResponse>(
          practiceSessionQuery(lessonId, routeVersionId).queryKey,
          (session) =>
            session
              ? appendPracticeAttempt(
                  session,
                  exercise.data.id,
                  result.attemptId,
                  result.isCorrect,
                )
              : session,
        )
      }
      if (round === SESSION_SIZE) {
        completion.mutate(nextAttemptIds)
      }
      idempotencyKey.current = crypto.randomUUID()
    },
  })

  useEffect(() => {
    const session = practiceSession.data
    if (!session || session.startedAt === hydratedSessionStartedAt) return

    setAnswer('')
    setRound(Math.min(session.answeredExercises + 1, SESSION_SIZE))
    setCompletedExerciseIds(session.completedExerciseIds)
    setAttemptIds(session.attemptIds)
    setCorrectAnswers(session.correctAnswers)
    setHydratedSessionStartedAt(session.startedAt)
    idempotencyKey.current = crypto.randomUUID()
    openedAt.current = Date.now()
  }, [hydratedSessionStartedAt, practiceSession.data])

  useEffect(() => {
    const session = practiceSession.data
    if (
      !session ||
      session.answeredExercises !== SESSION_SIZE ||
      exercise.data ||
      completion.isPending ||
      completion.data ||
      recoveredSessionCompletionStartedAt.current === session.startedAt
    ) {
      return
    }

    recoveredSessionCompletionStartedAt.current = session.startedAt
    completion.mutate(session.attemptIds, {
      onSuccess: () => setShowSummary(true),
    })
  }, [completion, exercise.data, practiceSession.data])

  useEffect(() => {
    if (!exercise.isFetching && !attempt.data) answerInput.current?.focus()
  }, [attempt.data, exercise.data?.id, exercise.isFetching])

  const recoveredCompletedSession = Boolean(
    practiceSession.data?.answeredExercises === SESSION_SIZE && !exercise.data,
  )

  if (
    exercise.isError ||
    lesson.isError ||
    course.isError ||
    practiceSession.isError
  ) {
    return (
      <PartPageState
        message={
          (
            exercise.error ??
            lesson.error ??
            course.error ??
            practiceSession.error
          )?.message
        }
      />
    )
  }

  if (
    lesson.isPending ||
    course.isPending ||
    practiceSession.isPending ||
    (!recoveredCompletedSession && exercise.isPending)
  ) {
    return <PartPageState loading />
  }

  if (recoveredCompletedSession) {
    if (completion.data && showSummary) {
      return (
        <PracticeSummary
          completion={completion.data}
          lessonId={lessonId}
          lessonTitle={localizedText(lesson.data.title)}
          lessonSummary={localizedText(lesson.data.summary)}
          onRestart={restartPractice}
        />
      )
    }
    if (completion.isError) {
      return (
        <PracticeCompletionState
          message={completion.error.message}
          onRetry={() => completion.mutate(attemptIds)}
        />
      )
    }
    return <PartPageState loading />
  }

  if (!exercise.data) return <PartPageState loading />

  const result = attempt.data?.result
  const activeExerciseId = exercise.data.id
  const isLastQuestion = round === SESSION_SIZE
  const canSubmit = Boolean(
    routeVersionId &&
    !attempt.isPending &&
    !completion.isPending &&
    !exercise.isFetching &&
    (result || answer.trim()),
  )

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    if (result) {
      if (isLastQuestion) {
        if (completion.isError) {
          completion.mutate(attemptIds)
        } else if (completion.data) {
          setShowSummary(true)
        }
      } else {
        if (round % PRACTICE_BLOCK_SIZE === 0) setShowBreak(true)
        else nextExercise()
      }
      return
    }

    attempt.mutate()
  }

  function restartPractice() {
    void practiceSession.refetch().then(({ data }) => {
      if (!data) return
      setHydratedSessionStartedAt(null)
      setShowSummary(false)
      attempt.reset()
      completion.reset()
    })
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

  if (showSummary && completion.data) {
    return (
      <PracticeSummary
        completion={completion.data}
        lessonId={lessonId}
        lessonTitle={localizedText(lesson.data.title)}
        lessonSummary={localizedText(lesson.data.summary)}
        onRestart={restartPractice}
      />
    )
  }

  if (showBreak) {
    const completedBlocks = Math.floor(round / PRACTICE_BLOCK_SIZE)
    return (
      <PageShell>
        <LessonWorkspaceHeader
          lessonId={lessonId}
          lessonTitle={localizedText(lesson.data.title)}
          lessonSummary={localizedText(lesson.data.summary)}
          activePart="practice"
        />
        <section className="mt-8 rounded-xl border bg-card p-6 text-center shadow-xs sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Блок {completedBlocks} из {SESSION_SIZE / PRACTICE_BLOCK_SIZE}
          </p>
          <h2 className="mt-3 font-serif text-2xl font-semibold sm:text-3xl">
            Можно сделать паузу
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Выполнено {round} из {SESSION_SIZE} заданий, верных —{' '}
            {correctAnswers}. Прогресс сохранён: можно выйти и вернуться позже.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/">Продолжить позже</Link>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setShowBreak(false)
                nextExercise()
              }}
            >
              Следующий блок
            </Button>
          </div>
        </section>
      </PageShell>
    )
  }

  const blockNumber = Math.ceil(round / PRACTICE_BLOCK_SIZE)
  const questionInBlock = ((round - 1) % PRACTICE_BLOCK_SIZE) + 1

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
            Блок {blockNumber} из {SESSION_SIZE / PRACTICE_BLOCK_SIZE} · Задание{' '}
            {questionInBlock} из {PRACTICE_BLOCK_SIZE}
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
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Проверенные ответы сохраняются автоматически.
          </p>
          <Button asChild size="sm" variant="ghost">
            <Link to="/lessons">Сохранить и выйти</Link>
          </Button>
        </div>
        <h2
          key={activeExerciseId}
          className={`motion-feedback mt-2 font-serif text-2xl font-semibold leading-snug transition-opacity sm:text-3xl ${
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
              aria-invalid={result ? !result.isCorrect : undefined}
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
              aria-busy={attempt.isPending || completion.isPending}
            >
              {result
                ? isLastQuestion
                  ? completion.isPending
                    ? 'Сохраняем…'
                    : completion.isError
                      ? 'Повторить'
                      : 'Результаты'
                  : round % PRACTICE_BLOCK_SIZE === 0
                    ? 'Завершить блок'
                    : 'Следующий'
                : attempt.isPending
                  ? 'Проверяем…'
                  : 'Проверить'}
            </Button>
          </div>
        </form>

        <div className="min-h-12 pt-3" aria-live="polite">
          {feedback && result ? (
            <div
              className={`motion-feedback flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm leading-6 ${
                result.isCorrect
                  ? 'border-primary/25 bg-primary/5 text-primary'
                  : 'border-destructive/25 bg-destructive/5 text-destructive'
              }`}
            >
              {result.isCorrect ? (
                <CheckCircle2Icon className="mt-1 size-4 shrink-0" />
              ) : (
                <CircleXIcon className="mt-1 size-4 shrink-0" />
              )}
              <p>
                {feedback}{' '}
                <span className="text-muted-foreground">
                  {isLastQuestion && completion.isPending
                    ? 'Сохраняем результат практики.'
                    : `Нажми Enter, чтобы ${
                        isLastQuestion ? 'увидеть результат' : 'продолжить'
                      }.`}
                </span>
              </p>
            </div>
          ) : null}
          {attempt.isError ? (
            <QueryError message={attempt.error.message} />
          ) : null}
          {completion.isError ? (
            <QueryError message={completion.error.message} />
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
          {completion.passed &&
          completion.progress.currentLessonId &&
          completion.progress.currentLessonId !== lessonId ? (
            <Button asChild size="sm">
              <Link
                to="/lessons/$lessonId/explanation"
                params={{ lessonId: completion.progress.currentLessonId }}
              >
                Следующий урок
              </Link>
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

function PracticeCompletionState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <PageShell>
      <QueryError message={message} />
      <Button className="mt-4" size="sm" onClick={onRetry}>
        Повторить сохранение
      </Button>
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
