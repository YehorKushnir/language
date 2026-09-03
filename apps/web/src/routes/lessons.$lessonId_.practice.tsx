import type {
  PracticeCompletionResponse,
  PracticeSessionResponse,
} from '@language/contracts'
import {
  checkStructuredAnswer,
  type StructuredAnswerCheckResult,
} from '@language/domain'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckCircle2Icon, CircleXIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import {
  completePractice,
  encounterExercise,
  submitExerciseAttempt,
} from '@/api/language-api'
import {
  courseProgressQuery,
  courseQuery,
  lessonQuery,
  nextExerciseQuery,
  practiceExerciseQuery,
  practiceSessionQuery,
  userVocabularyQuery,
} from '@/api/queries'
import { preloadCourseRoute } from '@/api/route-preload'
import { LessonWorkspaceHeader } from '@/components/lesson-workspace-header'
import { AudioButton } from '@/components/audio-button'
import { ExerciseReport } from '@/components/exercise-report'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { type AudioPlayback, playAudio } from '@/lib/audio-playback'
import { localizedText } from '@/lib/localized-text'
import {
  combineAnswerIssues,
  localAnswerFeedback,
} from '@/lib/local-answer-feedback'
import {
  appendPracticeAttempt,
  getNextPracticeCorrection,
  practiceIsReadyToComplete,
} from '@/lib/practice-session'

export const Route = createFileRoute('/lessons/$lessonId_/practice')({
  loader: ({ context, params }) =>
    Promise.all([
      preloadCourseRoute(
        context.queryClient,
        async (routeVersionId, queryClient) => {
          const session = await queryClient.ensureQueryData(
            practiceSessionQuery(params.lessonId, routeVersionId),
          )
          if (practiceIsReadyToComplete(session)) return

          const correctionExerciseId = getNextPracticeCorrection(session)
          if (correctionExerciseId) {
            await queryClient.ensureQueryData(
              practiceExerciseQuery(
                params.lessonId,
                correctionExerciseId,
                routeVersionId,
              ),
            )
            return
          }
          await queryClient.ensureQueryData(
            nextExerciseQuery(
              params.lessonId,
              routeVersionId,
              session.completedExerciseIds,
            ),
          )
        },
      ),
      context.queryClient.ensureQueryData(lessonQuery(params.lessonId)),
    ]),
  component: LessonPracticePage,
})

const SESSION_SIZE = 60

function LessonPracticePage() {
  const { lessonId } = Route.useParams()
  const queryClient = useQueryClient()
  const [answer, setAnswer] = useState('')
  const [localResult, setLocalResult] =
    useState<StructuredAnswerCheckResult | null>(null)
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
  const automaticPlayback = useRef<AudioPlayback | null>(null)
  const idempotencyKey = useRef(crypto.randomUUID())
  const continueAfterSave = useRef(false)
  const encounteredExerciseIds = useRef(new Set<string>())
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
  const effectiveCompletedExerciseIds = sessionIsHydrated
    ? completedExerciseIds
    : (practiceSession.data?.completedExerciseIds ?? completedExerciseIds)
  const effectiveCorrectionExerciseId = sessionIsHydrated
    ? currentCorrectionExerciseId
    : practiceSession.data
      ? getNextPracticeCorrection(practiceSession.data)
      : currentCorrectionExerciseId
  const primaryExercise = useQuery({
    ...nextExerciseQuery(
      lessonId,
      routeVersionId,
      effectiveCompletedExerciseIds,
    ),
    enabled: Boolean(
      routeVersionId &&
      practiceSession.data &&
      !effectiveCorrectionExerciseId &&
      effectiveCompletedExerciseIds.length < SESSION_SIZE,
    ),
  })
  const correctionExercise = useQuery({
    ...practiceExerciseQuery(
      lessonId,
      effectiveCorrectionExerciseId ?? '',
      routeVersionId,
    ),
    enabled: Boolean(
      routeVersionId && practiceSession.data && effectiveCorrectionExerciseId,
    ),
  })
  const exercise = effectiveCorrectionExerciseId
    ? correctionExercise
    : primaryExercise

  useEffect(() => {
    const exerciseId = exercise.data?.id
    if (
      !exerciseId ||
      !routeVersionId ||
      lesson.isPending ||
      course.isPending ||
      practiceSession.isPending ||
      exercise.isPending ||
      exercise.isFetching ||
      lesson.isError ||
      course.isError ||
      practiceSession.isError ||
      exercise.isError ||
      encounteredExerciseIds.current.has(exerciseId)
    ) {
      return
    }

    encounteredExerciseIds.current.add(exerciseId)
    void encounterExercise(lessonId, exerciseId, routeVersionId)
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
      .catch(() => encounteredExerciseIds.current.delete(exerciseId))
  }, [
    course.isPending,
    course.isError,
    exercise.data?.id,
    exercise.isError,
    exercise.isFetching,
    exercise.isPending,
    lesson.isPending,
    lesson.isError,
    lessonId,
    practiceSession.isPending,
    practiceSession.isError,
    queryClient,
    routeVersionId,
  ])
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
      void queryClient.invalidateQueries({
        queryKey: userVocabularyQuery(routeVersionId).queryKey,
      })
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
        completion.mutate(undefined, {
          onSuccess: () => {
            if (continueAfterSave.current) setShowSummary(true)
            continueAfterSave.current = false
          },
        })
      } else if (continueAfterSave.current) {
        continueAfterSave.current = false
        nextExercise()
      }
      idempotencyKey.current = crypto.randomUUID()
    },
    onError: () => {
      continueAfterSave.current = false
    },
  })

  useEffect(() => {
    const session = practiceSession.data
    if (!session || session.startedAt === hydratedSessionStartedAt) return

    setAnswer('')
    setLocalResult(null)
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
    if (!exercise.isFetching && !localResult) answerInput.current?.focus()
  }, [exercise.data?.id, exercise.isFetching, localResult])

  useEffect(
    () => () => {
      automaticPlayback.current?.stop()
    },
    [],
  )

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

  const activeExercise = exercise.data
  const result = attempt.data
  const activeExerciseId = activeExercise.id
  const updatedSession = pendingSessionUpdate.current
  const willComplete = Boolean(
    localResult && updatedSession && practiceIsReadyToComplete(updatedSession),
  )
  const canSubmit = Boolean(
    routeVersionId &&
    !completion.isPending &&
    !exercise.isFetching &&
    (localResult ? !attempt.isPending : answer.trim()),
  )

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (localResult && attempt.isPending) {
      continueAfterSave.current = true
      return
    }
    if (!canSubmit) return

    if (localResult) {
      automaticPlayback.current?.stop()
      automaticPlayback.current = null
      if (attempt.isError) {
        continueAfterSave.current = true
        attempt.mutate()
        return
      }
      if (!result) return
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

    if (!practiceSession.data) return
    const check = checkStructuredAnswer(answer, activeExercise.answerSpec)
    const optimisticSession = appendPracticeAttempt(
      {
        ...practiceSession.data,
        answeredExercises: completedExerciseIds.length,
        correctAnswers,
        attemptIds,
        completedExerciseIds,
        pendingCorrections,
      },
      activeExercise.id,
      `pending:${idempotencyKey.current}`,
      check.isCorrect,
    )
    setLocalResult(check)
    if (activeExercise.audioUrl) {
      automaticPlayback.current = playAudio(activeExercise.audioUrl)
    }
    pendingSessionUpdate.current = optimisticSession
    void prefetchFollowup(optimisticSession)
    attempt.mutate()
  }

  function prefetchFollowup(nextSession: PracticeSessionResponse) {
    const nextCorrection = getNextPracticeCorrection(nextSession)
    if (nextCorrection) {
      return queryClient.prefetchQuery(
        practiceExerciseQuery(lessonId, nextCorrection, routeVersionId),
      )
    }
    if (nextSession.completedExerciseIds.length < SESSION_SIZE) {
      return queryClient.prefetchQuery(
        nextExerciseQuery(
          lessonId,
          routeVersionId,
          nextSession.completedExerciseIds,
        ),
      )
    }
    return Promise.resolve()
  }

  function nextExercise() {
    const nextSession = pendingSessionUpdate.current
    if (!nextSession) return
    const nextCorrection = getNextPracticeCorrection(nextSession)

    automaticPlayback.current?.stop()
    automaticPlayback.current = null
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
    setLocalResult(null)
    continueAfterSave.current = false
    attempt.reset()
    pendingSessionUpdate.current = null
    idempotencyKey.current = crypto.randomUUID()
    openedAt.current = Date.now()

    queueMicrotask(() => {
      answerInput.current?.focus({ preventScroll: true })
    })
  }

  const feedback = result
    ? result.isCorrect
      ? 'Верно.'
      : combineAnswerIssues(
          result.diagnostics.map((diagnostic) =>
            localizedText(diagnostic.message),
          ),
        )
    : localResult
      ? localAnswerFeedback(localResult)
      : null
  const prompt = activeExercise.prompt.replace(/^Переведи на финский:\s*/u, '')

  if (showSummary && completion.data) {
    return (
      <PracticeSummary
        completion={completion.data}
        lessonId={lessonId}
        lessonTitle={localizedText(lesson.data.title)}
      />
    )
  }

  const displaySession = localResult && updatedSession ? updatedSession : null
  const displayedAnsweredExercises =
    displaySession?.answeredExercises ?? completedExerciseIds.length
  const displayedPendingCorrections =
    displaySession?.pendingCorrections.length ?? pendingCorrections.length
  const displayedCorrectAnswers =
    displaySession?.correctAnswers ?? correctAnswers
  const isFreeMode = practiceSession.data.mode === 'FREE'
  const requiredCorrectAnswers = practiceSession.data.requiredCorrectAnswers
  const missingCorrectAnswers = Math.max(
    0,
    requiredCorrectAnswers - displayedCorrectAnswers,
  )
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
          {isFreeMode ? (
            <p className="text-primary">Свободная практика</p>
          ) : mainRoundCompleted ? (
            <p className="text-primary">
              {missingCorrectAnswers > 0
                ? `Нужно ещё правильных ответов: ${missingCorrectAnswers}`
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
            ? missingCorrectAnswers > 0
              ? `Исправь ${Math.min(missingCorrectAnswers, displayedPendingCorrections)} из оставшихся ошибок, чтобы набрать 85%.`
              : isFreeMode
                ? 'Подводим итог свободной практики.'
                : 'Следующий урок сейчас откроется.'
            : isFreeMode
              ? 'Результат этой тренировки не изменит прогресс урока.'
              : `Для прохождения нужно не менее ${requiredCorrectAnswers} правильных ответов из ${SESSION_SIZE}.`}
        </p>
        <article className="mt-4 rounded-xl border border-border/70 bg-card p-4 shadow-xs sm:mt-5 sm:p-7">
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
                aria-readonly={Boolean(localResult) || exercise.isFetching}
                aria-invalid={localResult ? !localResult.isCorrect : undefined}
                onChange={(event) => {
                  if (!localResult && !exercise.isFetching) {
                    setAnswer(event.target.value)
                  }
                }}
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
                onPointerDown={(event) => {
                  event.preventDefault()
                  answerInput.current?.focus({ preventScroll: true })
                }}
              >
                {localResult
                  ? attempt.isPending
                    ? 'Сохраняем…'
                    : attempt.isError
                      ? 'Повторить'
                      : willComplete
                        ? completion.isPending
                          ? 'Сохраняем…'
                          : completion.isError
                            ? 'Повторить'
                            : 'Результаты'
                        : 'Следующий'
                  : 'Проверить'}
              </Button>
            </div>
          </form>

          <div className="pt-3" aria-live="polite">
            {feedback && localResult ? (
              <div className="motion-feedback grid gap-2">
                <div
                  className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm leading-6 ${
                    localResult.isCorrect
                      ? 'bg-primary/5 text-primary'
                      : 'bg-destructive/5 text-destructive'
                  }`}
                >
                  {localResult.isCorrect ? (
                    <CheckCircle2Icon className="mt-1 size-4 shrink-0" />
                  ) : (
                    <CircleXIcon className="mt-1 size-4 shrink-0" />
                  )}
                  <p>
                    {feedback}{' '}
                    <span className="text-muted-foreground">
                      {attempt.isPending
                        ? 'Сохраняем прогресс.'
                        : attempt.isError
                          ? 'Не удалось сохранить. Нажми Enter, чтобы повторить.'
                          : willComplete && completion.isPending
                            ? 'Сохраняем результат практики.'
                            : `Нажми Enter, чтобы ${
                                willComplete
                                  ? 'увидеть результат'
                                  : 'продолжить'
                              }.`}
                    </span>
                  </p>
                </div>
                {activeExercise.audioUrl ? (
                  <AudioButton
                    className="w-fit"
                    label="Прослушать ответ"
                    src={activeExercise.audioUrl}
                  />
                ) : null}
              </div>
            ) : null}
            {attempt.isError ? (
              <div className="mt-2">
                <QueryError message={attempt.error.message} />
              </div>
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
  const isFreeMode = completion.mode === 'FREE'

  return (
    <PageShell>
      <LessonWorkspaceHeader
        lessonId={lessonId}
        lessonTitle={lessonTitle}
        activePart="practice"
      />
      <section className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          {isFreeMode ? 'Свободная практика завершена' : 'Практика завершена'}
        </p>
        <h2 className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">
          {isFreeMode ? 'Тренировка окончена' : 'Урок пройден'}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Правильных ответов: {completion.correctAnswers} из{' '}
          {completion.totalExercises} — {completion.scorePercent}%.{' '}
          {isFreeMode
            ? 'Прогресс урока остался без изменений.'
            : 'Для прохождения достаточно 85%.'}
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
                {isFreeMode ? 'Продолжить курс' : 'Следующий урок'}
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
