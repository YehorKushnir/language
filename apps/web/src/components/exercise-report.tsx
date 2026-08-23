import type { ExerciseReportReason } from '@language/contracts'
import { useMutation } from '@tanstack/react-query'
import { CheckIcon, FlagIcon } from 'lucide-react'
import { useState } from 'react'

import { reportExercise } from '@/api/language-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
          'flex items-center gap-1.5 text-xs text-muted-foreground',
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
          className="grid gap-2 rounded-md border bg-muted/20 p-3 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_auto]"
          onSubmit={(event) => {
            event.preventDefault()
            if (!report.isPending) report.mutate()
          }}
        >
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Причина
            <select
              className="h-9 rounded-md border bg-background px-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
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
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Комментарий
            <Input
              className="h-9"
              maxLength={500}
              placeholder="Что именно не так?"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </label>
          <div className="flex items-end gap-1.5">
            <Button size="sm" type="submit" disabled={report.isPending}>
              {report.isPending ? 'Отправляем…' : 'Отправить'}
            </Button>
            <Button
              size="sm"
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
          </div>
          {report.isError ? (
            <p className="text-xs text-destructive sm:col-span-3">
              {report.error.message}
            </p>
          ) : null}
        </form>
      )}
    </div>
  )
}
