import type {
  AdminExerciseReportResponse,
  ExerciseReportReason,
  ExerciseReportStatus,
} from '@language/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  AlertTriangleIcon,
  CheckIcon,
  DownloadIcon,
  LoaderCircleIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import { useState } from 'react'

import {
  ApiError,
  downloadAdminReports,
  updateAdminReportStatus,
} from '@/api/language-api'
import { adminReportsQuery } from '@/api/queries'
import { LearningPageHeader } from '@/components/learning-page-header'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const statuses: ExerciseReportStatus[] = [
  'NEW',
  'IN_PROGRESS',
  'FIXED',
  'DISMISSED',
]

const statusLabels: Record<ExerciseReportStatus, string> = {
  NEW: 'Новая',
  IN_PROGRESS: 'В работе',
  FIXED: 'Исправлена',
  DISMISSED: 'Отклонена',
}

const reasonLabels: Record<ExerciseReportReason, string> = {
  WRONG_PROMPT: 'Ошибка в задании',
  WRONG_ANSWER: 'Неверный ожидаемый ответ',
  UNNATURAL_LANGUAGE: 'Неестественная фраза',
  TECHNICAL_PROBLEM: 'Техническая проблема',
  OTHER: 'Другое',
}

type ReportFilter = ExerciseReportStatus | 'ALL'

export const Route = createFileRoute('/admin/reports')({
  validateSearch: (search: Record<string, unknown>): AdminReportSearch => ({
    status: isReportFilter(search.status) ? search.status : undefined,
  }),
  loaderDeps: ({ search }) => ({ filter: search.status ?? 'NEW' }),
  loader: async ({ context, deps }) => {
    const status = deps.filter === 'ALL' ? undefined : deps.filter
    await context.queryClient.prefetchQuery(adminReportsQuery(status))
  },
  component: AdminReportsPage,
})

interface AdminReportSearch {
  status?: ReportFilter
}

function AdminReportsPage() {
  const search = Route.useSearch()
  const queryClient = useQueryClient()
  const filter = search.status ?? 'NEW'
  const status = filter === 'ALL' ? undefined : filter
  const reports = useQuery(adminReportsQuery(status))
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string>()
  const updateStatus = useMutation({
    mutationFn: ({
      reportId,
      status: nextStatus,
    }: {
      reportId: string
      status: ExerciseReportStatus
    }) => updateAdminReportStatus(reportId, { status: nextStatus }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
  })

  async function exportReports() {
    setExportError(undefined)
    setExporting(true)
    try {
      const exported = await downloadAdminReports(status)
      const blob = new Blob([JSON.stringify(exported.data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = exported.filename
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : 'Не удалось выгрузить жалобы',
      )
    } finally {
      setExporting(false)
    }
  }

  if (reports.isPending) {
    return (
      <PageShell>
        <PageLoading />
      </PageShell>
    )
  }
  if (reports.isError) {
    if (reports.error instanceof ApiError && reports.error.status === 403) {
      return <AdminAccessDenied />
    }
    return (
      <PageShell>
        <QueryError message={reports.error.message} />
      </PageShell>
    )
  }

  const filters: Array<{ id: ReportFilter; label: string; count: number }> = [
    { id: 'ALL', label: 'Все', count: reports.data.totalCount },
    ...statuses.map((item) => ({
      id: item,
      label: statusLabels[item],
      count: reports.data.counts[item],
    })),
  ]

  return (
    <PageShell>
      <LearningPageHeader
        eyebrow={
          <>
            <ShieldCheckIcon className="size-3.5" /> Администрирование
          </>
        }
        title="Жалобы пользователей"
        description="Проблемы в заданиях, отправленные пользователями. Новые жалобы показаны первыми."
        aside={
          <Button
            className="w-full"
            disabled={exporting}
            onClick={() => void exportReports()}
            size="sm"
          >
            {exporting ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <DownloadIcon />
            )}
            {exporting ? 'Готовим JSON…' : 'Экспорт текущего фильтра'}
          </Button>
        }
      />

      {exportError ? (
        <Alert className="motion-feedback mt-5" variant="destructive">
          <AlertTriangleIcon />
          <AlertDescription>{exportError}</AlertDescription>
        </Alert>
      ) : null}

      <nav
        aria-label="Статус жалоб"
        className="mt-5 flex w-full gap-1 overflow-x-auto rounded-lg border bg-muted/25 p-1 sm:w-fit"
      >
        {filters.map((item) => (
          <Button
            asChild
            key={item.id}
            className="flex-1 sm:flex-none"
            size="sm"
            variant={filter === item.id ? 'secondary' : 'ghost'}
          >
            <Link
              aria-current={filter === item.id ? 'page' : undefined}
              preload="viewport"
              replace
              search={{ status: item.id === 'NEW' ? undefined : item.id }}
              to="/admin/reports"
            >
              {item.label}
              <span className="tabular-nums text-muted-foreground">
                {item.count}
              </span>
            </Link>
          </Button>
        ))}
      </nav>

      {updateStatus.isError ? (
        <Alert className="motion-feedback mt-4" variant="destructive">
          <AlertTriangleIcon />
          <AlertDescription>{updateStatus.error.message}</AlertDescription>
        </Alert>
      ) : null}

      {reports.data.items.length === 0 ? (
        <section className="mt-6 rounded-xl border border-dashed p-6 text-center">
          <h2 className="text-sm font-semibold">В этом статусе жалоб нет</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Выбери другой фильтр или дождись новых сообщений.
          </p>
        </section>
      ) : (
        <section className="mt-5 grid gap-3" aria-label="Список жалоб">
          {reports.data.items.map((report) => (
            <ReportCard
              key={report.id}
              disabled={updateStatus.isPending}
              report={report}
              onStatusChange={(nextStatus) =>
                updateStatus.mutate({
                  reportId: report.id,
                  status: nextStatus,
                })
              }
            />
          ))}
        </section>
      )}
    </PageShell>
  )
}

function ReportCard({
  disabled,
  report,
  onStatusChange,
}: {
  disabled: boolean
  report: AdminExerciseReportResponse
  onStatusChange: (status: ExerciseReportStatus) => void
}) {
  return (
    <article className="rounded-xl border bg-card p-4 shadow-xs sm:p-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{reasonLabels[report.reason]}</Badge>
            <Badge
              className={cn(
                report.status === 'NEW' &&
                  'border-primary/25 bg-primary/10 text-primary',
                report.status === 'FIXED' &&
                  'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200',
              )}
              variant="outline"
            >
              {statusLabels[report.status]}
            </Badge>
          </div>
          <p className="mt-2 text-sm font-medium">
            {report.reporter.name}{' '}
            <a
              className="font-normal text-muted-foreground hover:text-foreground"
              href={`mailto:${report.reporter.email}`}
            >
              · {report.reporter.email}
            </a>
          </p>
          <time
            className="mt-0.5 block text-xs text-muted-foreground"
            dateTime={report.createdAt}
          >
            {formatDateTime(report.createdAt)}
          </time>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`report-status-${report.id}`}>
            Статус жалобы
          </label>
          <select
            id={`report-status-${report.id}`}
            aria-label={`Статус жалобы от ${report.reporter.name}`}
            className="h-9 rounded-md border bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            disabled={disabled}
            value={report.status}
            onChange={(event) =>
              onStatusChange(event.target.value as ExerciseReportStatus)
            }
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
          {report.status !== 'FIXED' ? (
            <Button
              disabled={disabled}
              onClick={() => onStatusChange('FIXED')}
              size="sm"
              variant="outline"
            >
              <CheckIcon /> Исправлено
            </Button>
          ) : null}
        </div>
      </header>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-6">
        {report.comment || 'Комментарий не оставлен.'}
      </p>

      <dl className="mt-4 grid gap-3 rounded-lg bg-muted/25 p-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Задание</dt>
          <dd className="mt-1 font-medium">{report.exercise.prompt}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">
            Ответ пользователя
          </dt>
          <dd className="mt-1 font-medium" lang="fi">
            {report.attempt.answerText}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">
            Ожидаемый ответ
          </dt>
          <dd className="mt-1 font-medium" lang="fi">
            {report.exercise.expectedAnswer}
          </dd>
        </div>
      </dl>

      <p className="mt-3 break-all text-xs text-muted-foreground">
        {report.exercise.lessonId ? `Урок: ${report.exercise.lessonId} · ` : ''}
        Упражнение: {report.exerciseId} · Жалоба: {report.id}
      </p>
    </article>
  )
}

function AdminAccessDenied() {
  return (
    <PageShell>
      <section className="mx-auto max-w-lg rounded-xl border bg-card p-6 text-center shadow-xs sm:p-8">
        <ShieldCheckIcon className="mx-auto size-8 text-muted-foreground" />
        <h1 className="mt-4 font-serif text-2xl font-semibold">Нет доступа</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Эта страница доступна только администратору.
        </p>
      </section>
    </PageShell>
  )
}

function isReportFilter(value: unknown): value is ReportFilter {
  return value === 'ALL' || statuses.includes(value as ExerciseReportStatus)
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
