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
  practiceExerciseQuery,
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
import {
  appendPracticeAttempt,
  getNextPracticeCorrection,
  practiceIsReadyToComplete,
} from '@/lib/practice-session'

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
  const [pendingCorrections, setPendingCorrections] = useState<
    PracticeSessionResponse['pendingCorrections']
  >([])
  const [currentCorrectionExerciseId, setCurrentCorrectionExerciseId] =
    useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [hydratedSessionStartedAt, setHydratedSessionStartedAt] = useState<
    string | null
  >(null)
  const answerInput = useRef<HTMLInputElement>(null)
  const idempotencyKey = useRef(crypto.randomUUID())
  const openedAt = useRef(Date.now())
  const recoveredSessionCompletionStartedAt = useRef<string | null>(null)
  const pendingSessionUpdate = useRef<PracticeSessionResponse | null>(null)
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
  const primaryExercise = useQuery({
    ...nextExerciseQuery(lessonId, routeVersionId, completedExerciseIds),
    enabled: Boolean(
      routeVersionId &&
      sessionIsHydrated &&
      !currentCorrectionExerciseId &&
      completedExerciseIds.length < SESSION_SIZE,
    ),
  })
  const correctionExercise = useQuery({
    ...practiceExerciseQuery(
      lessonId,
      currentCorrectionExerciseId ?? '',
      routeVersionId,
    ),
    enabled: Boolean(
      routeVersionId && sessionIsHydrated && currentCorrectionExerciseId,
    ),
  })
  const exercise = currentCorrectionExerciseId
    ? correctionExercise
    : primaryExercise
  const completion = useMutation({
    mutationFn: () => completePractice(routeVersionId, lessonId),
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
      return result
    },
    onSuccess: (result) => {
      if (!exercise.data || !practiceSession.data) return
      const updatedSession = appendPracticeAttempt(
        {
          ...practiceSession.data,
          answeredExercises: completedExerciseIds.length,
          correctAnswers,
          attemptIds,
          completedExerciseIds,
          pendingCorrections,
        },
        exercise.data.id,
        result.attemptId,
        result.isCorrect,
      )

      pendingSessionUpdate.current = updatedSession
      queryClient.setQueryData<PracticeSessionResponse>(
        practiceSessionQuery(lessonId, routeVersionId).queryKey,
        updatedSession,
      )
      if (practiceIsReadyToComplete(updatedSession)) {
        completion.mutate()
      }
      idempotencyKey.current = crypto.randomUUID()
    },
  })

  useEffect(() => {
    const session = practiceSession.data
    if (!session || session.startedAt === hydratedSessionStartedAt) return

    setAnswer('')
    const nextCorrection = getNextPracticeCorrection(session)
    setRound(
      nextCorrection
        ? session.answeredExercises
        : Math.min(session.answeredExercises + 1, SESSION_SIZE),
    )
    setCompletedExerciseIds(session.completedExerciseIds)
    setAttemptIds(session.attemptIds)
    setCorrectAnswers(session.correctAnswers)
    setPendingCorrections(session.pendingCorrections)
    setCurrentCorrectionExerciseId(nextCorrection)
    setHydratedSessionStartedAt(session.startedAt)
    pendingSessionUpdate.current = null
    idempotencyKey.current = crypto.randomUUID()
    openedAt.current = Date.now()
  }, [hydratedSessionStartedAt, practiceSession.data])

  useEffect(() => {
    const session = practiceSession.data
    if (
      !session ||
      !practiceIsReadyToComplete(session) ||
      exercise.data ||
      completion.isPending ||
      completion.data ||
      recoveredSessionCompletionStartedAt.current === session.startedAt
    ) {
      return
    }

    recoveredSessionCompletionStartedAt.current = session.startedAt
    completion.mutate(undefined, {
      onSuccess: () => setShowSummary(true),
    })
  }, [completion, exercise.data, practiceSession.data])

  useEffect(() => {
    if (!exercise.isFetching && !attempt.data) answerInput.current?.focus()
  }, [attempt.data, exercise.data?.id, exercise.isFetching])

  const recoveredCompletedSession = Boolean(
    practiceSession.data &&
    practiceIsReadyToComplete(practiceSession.data) &&
    !exercise.data,
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
        />
      )
    }
    if (completion.isError) {
      return (
        <PracticeCompletionState
          message={completion.error.message}
          onRetry={() => completion.mutate()}
        />
      )
    }
    return <PartPageState loading />
  }

  if (!exercise.data) return <PartPageState loading />

  const result = attempt.data
  const activeExerciseId = exercise.data.id
  const updatedSession = pendingSessionUpdate.current
  const willComplete = Boolean(
    result && updatedSession && practiceIsReadyToComplete(updatedSession),
  )
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
      if (willComplete) {
        if (completion.isError) {
          completion.mutate()
        } else if (completion.data) {
          setShowSummary(true)
        }
      } else {
        nextExercise()
      }
      return
    }

    attempt.mutate()
  }

  function nextExercise() {
    const nextSession = pendingSessionUpdate.current
    if (!nextSession) return
    const nextCorrection = getNextPracticeCorrection(nextSession)

    setCompletedExerciseIds(nextSession.completedExerciseIds)
    setAttemptIds(nextSession.attemptIds)
    setCorrectAnswers(nextSession.correctAnswers)
    setPendingCorrections(nextSession.pendingCorrections)
    setCurrentCorrectionExerciseId(nextCorrection)
    setRound(
      nextCorrection
        ? nextSession.answeredExercises
        : Math.min(nextSession.answeredExercises + 1, SESSION_SIZE),
    )
    setAnswer('')
    attempt.reset()
    pendingSessionUpdate.current = null
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
      />
    )
  }

  const displaySession = result && updatedSession ? updatedSession : null
  const displayedAnsweredExercises =
    displaySession?.answeredExercises ?? completedExerciseIds.length
  const displayedPendingCorrections =
    displaySession?.pendingCorrections.length ?? pendingCorrections.length
  const mainRoundCompleted = displayedAnsweredExercises === SESSION_SIZE

  return (
    <PageShell className="py-4 sm:py-10">
      <LessonWorkspaceHeader
        lessonId={lessonId}
        lessonTitle={localizedText(lesson.data.title)}
        activePart="practice"
      />

      <section className="mt-4 sm:mt-8">
        <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-wider">
          {mainRoundCompleted ? (
            <p className="text-primary">
              {displayedPendingCorrections > 0
                ? `Осталось исправить: ${displayedPendingCorrections}`
                : 'Завершаем…'}
            </p>
          ) : currentCorrectionExerciseId ? (
            <p className="text-muted-foreground">Повтор ошибки</p>
          ) : (
            <span aria-hidden="true" />
          )}
          <p className="tabular-nums text-muted-foreground">
            {round} из {SESSION_SIZE}
          </p>
        </div>
        <Progress
          className="mt-3 h-1.5"
          value={(displayedAnsweredExercises / SESSION_SIZE) * 100}
          aria-label="Прогресс практики"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          {mainRoundCompleted
            ? displayedPendingCorrections > 0
              ? 'Исправь ошибки, чтобы открыть следующий урок.'
              : 'Следующий урок сейчас откроется.'
            : 'Заверши практику, чтобы открыть следующий урок.'}
        </p>
        <article className="mt-4 rounded-xl border bg-card p-4 shadow-xs sm:mt-5 sm:p-7">
          <h2
            key={activeExerciseId}
            className={`motion-feedback font-serif text-2xl font-semibold leading-snug transition-opacity sm:text-3xl ${
              exercise.isFetching ? 'opacity-40' : ''
            }`}
          >
            {prompt}
          </h2>

          <form className="mt-5 sm:mt-6" onSubmit={submit}>
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
                  ? willComplete
                    ? completion.isPending
                      ? 'Сохраняем…'
                      : completion.isError
                        ? 'Повторить'
                        : 'Результаты'
                    : 'Следующий'
                  : attempt.isPending
                    ? 'Проверяем…'
                    : 'Проверить'}
              </Button>
            </div>
          </form>

          <div className="pt-3" aria-live="polite">
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
                    {willComplete && completion.isPending
                      ? 'Сохраняем результат практики.'
                      : `Нажми Enter, чтобы ${
                          willComplete ? 'увидеть результат' : 'продолжить'
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
        </article>
      </section>
    </PageShell>
  )
}

function PracticeSummary({
  completion,
  lessonId,
  lessonTitle,
}: {
  completion: PracticeCompletionResponse
  lessonId: string
  lessonTitle: string
}) {
  return (
    <PageShell>
      <LessonWorkspaceHeader
        lessonId={lessonId}
        lessonTitle={lessonTitle}
        activePart="practice"
      />
      <section className="mt-8 border-t pt-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Практика завершена
        </p>
        <h2 className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">
          Урок пройден
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Выполнены все {completion.totalExercises} заданий, ошибки исправлены.
        </p>
        <Progress
          className="mt-5 h-2"
          value={completion.scorePercent}
          aria-label="Результат практики"
        />
        <div className="mt-6 flex flex-wrap gap-2">
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
