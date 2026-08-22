import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { completeLessonPart, submitExerciseAttempt } from '@/api/language-api'
import {
  courseProgressQuery,
  courseQuery,
  lessonQuery,
  nextExerciseQuery,
} from '@/api/queries'
import { LessonWorkspaceHeader } from '@/components/lesson-workspace-header'
import { PageLoading, QueryError } from '@/components/query-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { localizedText } from '@/lib/localized-text'
import { startAppViewTransition } from '@/lib/view-transition'

export const Route = createFileRoute('/lessons/$lessonId_/practice')({
  component: LessonPracticePage,
})

const SESSION_SIZE = 3

function LessonPracticePage() {
  const { lessonId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [answer, setAnswer] = useState('')
  const [round, setRound] = useState(1)
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([])
  const answerInput = useRef<HTMLInputElement>(null)
  const idempotencyKey = useRef(crypto.randomUUID())
  const openedAt = useRef(Date.now())
  const exercise = useQuery(nextExerciseQuery(lessonId, completedExerciseIds))
  const lesson = useQuery(lessonQuery(lessonId))
  const course = useQuery(courseQuery)
  const routeVersionId = course.data?.route?.id ?? ''
  const attempt = useMutation({
    mutationFn: async () => {
      if (!exercise.data) throw new Error('Упражнение ещё не загружено')

      const result = await submitExerciseAttempt(exercise.data.id, {
        answer,
        idempotencyKey: idempotencyKey.current,
        routeVersionId,
        durationMs: Date.now() - openedAt.current,
      })
      const updatedProgress =
        round === SESSION_SIZE
          ? await completeLessonPart(routeVersionId, lessonId, 'practice')
          : null

      return { result, updatedProgress }
    },
    onSuccess: ({ updatedProgress }) => {
      if (updatedProgress) {
        queryClient.setQueryData(
          courseProgressQuery(routeVersionId).queryKey,
          updatedProgress,
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
        startAppViewTransition(() =>
          navigate({
            to: '/lessons/$lessonId',
            params: { lessonId },
          }),
        )
      } else {
        nextExercise()
      }
      return
    }

    attempt.mutate()
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

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-5 sm:py-10">
      <LessonWorkspaceHeader
        lessonId={lessonId}
        lessonTitle={localizedText(lesson.data.title)}
        lessonSummary={localizedText(lesson.data.summary)}
        activePart="practice"
      />

      <section className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Задание {round} из {SESSION_SIZE}
        </p>
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
                  ? 'К уроку'
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
      </section>
    </main>
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
    <main className="mx-auto w-full max-w-5xl px-5 py-10">
      {loading ? <PageLoading /> : <QueryError message={message} />}
    </main>
  )
}
