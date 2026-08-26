import type { ExerciseReportReason } from '@language/contracts'
import { useMutation } from '@tanstack/react-query'
import { CheckIcon, FlagIcon } from 'lucide-react'
import { useId, useState } from 'react'

import { reportExercise } from '@/api/language-api'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const reasons: Array<{ value: ExerciseReportReason; label: string }> = [
  { value: 'WRONG_PROMPT', label: 'Ошибка в задании' },
  { value: 'WRONG_ANSWER', label: 'Неверный ожидаемый ответ' },
  { value: 'UNNATURAL_LANGUAGE', label: 'Неестественная фраза' },
  { value: 'TECHNICAL_PROBLEM', label: 'Техническая проблема' },
  { value: 'OTHER', label: 'Другое' },
]

export function ExerciseReport({
  exerciseId,
  attemptId,
  className,
}: {
  exerciseId: string
  attemptId: string
  className?: string
}) {
  const titleId = useId()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ExerciseReportReason>('WRONG_ANSWER')
  const [comment, setComment] = useState('')
  const report = useMutation({
    mutationFn: () =>
      reportExercise(exerciseId, {
        attemptId,
        reason,
        ...(comment.trim() ? { comment: comment.trim() } : {}),
      }),
  })

  if (report.isSuccess) {
    return (
      <p
        className={cn(
          'motion-feedback flex items-center gap-1.5 text-xs text-muted-foreground',
          className,
        )}
      >
        <CheckIcon className="size-3.5 text-primary" /> Отправлено на проверку
      </p>
    )
  }

  return (
    <div className={className}>
      {!open ? (
        <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
          <FlagIcon /> Сообщить о проблеме
        </Button>
      ) : (
        <form
          aria-labelledby={titleId}
          className="motion-feedback rounded-xl border bg-card p-4 shadow-xs sm:p-5"
          onSubmit={(event) => {
            event.preventDefault()
            if (!report.isPending) report.mutate()
          }}
        >
          <header className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <FlagIcon className="size-4" />
            </span>
            <div>
              <h3 id={titleId} className="text-sm font-semibold">
                Сообщить о проблеме
              </h3>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Выбери причину и, если можешь, опиши, что именно не так.
              </p>
            </div>
          </header>

          <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(12rem,0.75fr)_minmax(0,1.25fr)]">
            <label className="grid content-start gap-1.5 text-sm font-medium">
              Причина
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[border-color,box-shadow] duration-150 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value as ExerciseReportReason)
                }
              >
                {reasons.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              <span>
                Комментарий{' '}
                <span className="font-normal text-muted-foreground">
                  (необязательно)
                </span>
              </span>
              <textarea
                className="min-h-24 w-full resize-y rounded-md border bg-background px-3 py-2.5 text-sm leading-5 text-foreground shadow-xs outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                maxLength={500}
                placeholder="Например: правильный вариант тоже должен приниматься"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
              <span className="justify-self-end text-xs font-normal tabular-nums text-muted-foreground">
                {comment.length}/500
              </span>
            </label>
          </div>

          {report.isError ? (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {report.error.message}
            </p>
          ) : null}

          <div className="mt-4 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button
              className="w-full sm:w-auto"
              type="submit"
              disabled={report.isPending}
            >
              {report.isPending ? 'Отправляем…' : 'Отправить жалобу'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
