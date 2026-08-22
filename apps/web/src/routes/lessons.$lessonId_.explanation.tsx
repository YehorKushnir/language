import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { CheckIcon, LightbulbIcon, LoaderCircleIcon } from 'lucide-react'

import { completeLessonPart } from '@/api/language-api'
import { courseProgressQuery, courseQuery, lessonQuery } from '@/api/queries'
import { LessonWorkspaceHeader } from '@/components/lesson-workspace-header'
import { PageLoading, QueryError } from '@/components/query-state'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { localizedText } from '@/lib/localized-text'

export const Route = createFileRoute('/lessons/$lessonId_/explanation')({
  component: LessonExplanationPage,
})

function LessonExplanationPage() {
  const { lessonId } = Route.useParams()
  const queryClient = useQueryClient()
  const lesson = useQuery(lessonQuery(lessonId))
  const course = useQuery(courseQuery)
  const routeVersionId = course.data?.route?.id ?? ''
  const progress = useQuery({
    ...courseProgressQuery(routeVersionId),
    enabled: Boolean(routeVersionId),
  })
  const completion = useMutation({
    mutationFn: () =>
      completeLessonPart(routeVersionId, lessonId, 'explanation'),
    onSuccess: (updatedProgress) => {
      queryClient.setQueryData(
        courseProgressQuery(routeVersionId).queryKey,
        updatedProgress,
      )
    },
  })

  if (lesson.isPending || course.isPending) return <PartPageState loading />
  if (lesson.isError || course.isError) {
    return <PartPageState message={(lesson.error ?? course.error)?.message} />
  }

  const lessonProgress = progress.data?.lessons.find(
    (item) => item.lessonId === lessonId,
  )
  const completed = Boolean(lessonProgress?.explanationCompletedAt)
  const screens = lesson.data.content.explanationScreens

  if (screens.length === 0) {
    return <PartPageState message="В уроке пока нет объяснения." />
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-5 sm:py-10">
      <LessonWorkspaceHeader
        lessonId={lessonId}
        lessonTitle={localizedText(lesson.data.title)}
        lessonSummary={localizedText(lesson.data.summary)}
        activePart="explanation"
      />

      <article className="mt-7 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="divide-y">
          {screens.map((screen, screenIndex) => (
            <section key={screen.id} className="py-7 first:pt-6">
              {screen.eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {localizedText(screen.eyebrow)}
                </p>
              ) : null}
              <h2 className="mt-1 font-serif text-xl font-semibold sm:text-2xl">
                {screenIndex + 1}. {localizedText(screen.title)}
              </h2>
              <div className="mt-3 grid gap-3 text-[15px] leading-7 text-foreground/85">
                {screen.paragraphs.map((paragraph, index) => (
                  <p key={index}>{localizedText(paragraph)}</p>
                ))}
              </div>

              {screen.table ? (
                <div className="mt-5 overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {screen.table.headers.map((header, index) => (
                          <TableHead key={index} className="h-9 text-xs">
                            {localizedText(header)}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {screen.table.rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <TableCell
                              key={cellIndex}
                              className={
                                cellIndex === 1 ? 'py-2 font-semibold' : 'py-2'
                              }
                            >
                              {localizedText(cell)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : null}

              {screen.examples?.length ? (
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {screen.examples.map((example) => (
                    <div
                      key={example.target}
                      className="border-l-2 border-primary/35 py-1 pl-3"
                    >
                      <p className="text-sm font-semibold">{example.target}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {localizedText(example.source)}
                      </p>
                      {example.note ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {localizedText(example.note)}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {screen.callout ? (
                <Alert className="mt-5 py-3">
                  <LightbulbIcon />
                  <AlertDescription>
                    {localizedText(screen.callout)}
                  </AlertDescription>
                </Alert>
              ) : null}
            </section>
          ))}
        </div>
      </article>

      {completion.isError ? (
        <div className="mb-4">
          <QueryError message={completion.error.message} />
        </div>
      ) : null}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t py-6">
        <p className="text-sm text-muted-foreground">
          {completed
            ? 'Объяснение отмечено как прочитанное.'
            : 'Можно вернуться к этому тексту в любой момент.'}
        </p>
        <Button
          size="sm"
          variant={completed ? 'secondary' : 'default'}
          disabled={!routeVersionId || completion.isPending || completed}
          onClick={() => completion.mutate()}
        >
          {completion.isPending ? (
            <LoaderCircleIcon className="animate-spin" />
          ) : (
            <CheckIcon />
          )}
          {completed ? 'Прочитано' : 'Отметить прочитанным'}
        </Button>
      </footer>
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
