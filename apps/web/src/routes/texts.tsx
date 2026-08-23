import type { PreparedTextSummaryResponse } from '@language/contracts'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRightIcon, FileTextIcon } from 'lucide-react'

import { courseQuery, preparedTextsQuery } from '@/api/queries'
import { preloadCourseRoute } from '@/api/route-preload'
import { LearningPageHeader } from '@/components/learning-page-header'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'
import { Progress } from '@/components/ui/progress'
import { localizedText } from '@/lib/localized-text'

export const Route = createFileRoute('/texts')({
  loader: ({ context }) =>
    preloadCourseRoute(context.queryClient, (routeVersionId, queryClient) =>
      queryClient.ensureQueryData(preparedTextsQuery(routeVersionId)),
    ),
  component: TextsPage,
})

const textCategories = [
  { level: 'A1', title: 'Начальный уровень' },
  { level: 'A2', title: 'Базовый уровень' },
  { level: 'B1', title: 'Средний уровень' },
  { level: 'B2', title: 'Выше среднего' },
] as const

type TextCategory = (typeof textCategories)[number]['level']

function TextsPage() {
  const course = useQuery(courseQuery)
  const routeVersionId = course.data?.route?.id ?? ''
  const texts = useQuery({
    ...preparedTextsQuery(routeVersionId),
    enabled: Boolean(routeVersionId),
  })

  if (course.isPending || texts.isPending) return <PageState loading />
  if (course.isError || texts.isError) {
    return <PageState message={(course.error ?? texts.error)?.message} />
  }

  const textsByCategory = new Map<TextCategory, PreparedTextSummaryResponse[]>(
    textCategories.map(({ level }) => [level, []]),
  )

  for (const text of texts.data.items) {
    textsByCategory.get(toTextCategory(text.level))?.push(text)
  }

  return (
    <PageShell>
      <LearningPageHeader
        eyebrow="Чтение с разбором"
        title="Тексты"
        description="Читай тексты своего уровня и сразу проверяй значение незнакомых слов."
      />

      <div className="mt-7 grid gap-9">
        {textCategories.map((category) => {
          const categoryTexts = textsByCategory.get(category.level) ?? []

          return (
            <section key={category.level}>
              <header className="flex items-baseline justify-between gap-4 border-b px-1 pb-3">
                <h2 className="font-serif text-xl font-semibold">
                  {category.level} · {category.title}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {formatTextCount(categoryTexts.length)}
                </span>
              </header>

              {categoryTexts.length > 0 ? (
                <ol className="mt-3 grid gap-2">
                  {categoryTexts.map((text, index) => (
                    <li key={text.id}>
                      <Link
                        to="/texts/$textId"
                        params={{ textId: text.id }}
                        aria-label={`Открыть ${localizedText(text.title)}`}
                        className="interactive-row group flex min-h-16 items-center gap-3.5 rounded-xl border bg-card px-4 py-3 shadow-xs transition-[border-color,box-shadow,transform] duration-150 hover:border-primary/25 hover:shadow-sm active:scale-[0.998] sm:px-5"
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium tabular-nums text-muted-foreground">
                          {index + 1}
                        </span>
                        <FileTextIcon className="size-4 shrink-0 text-primary/65" />
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-[15px] font-medium leading-5 sm:text-base">
                            {localizedText(text.title)}
                          </h3>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {text.wordCount} слов
                          </p>
                        </div>
                        <div className="hidden w-36 shrink-0 sm:block">
                          <Progress
                            className="h-1.5"
                            value={text.knownPercent}
                            aria-label={`Знакомые слова в тексте ${localizedText(text.title)}`}
                          />
                        </div>
                        <span className="min-w-24 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
                          {text.knownPercent}% знакомых
                        </span>
                        <span className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-[background-color,color,transform] duration-150 group-hover:translate-x-0.5 group-hover:bg-secondary group-hover:text-primary">
                          <ArrowRightIcon className="size-4" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed px-5 py-5 text-sm text-muted-foreground">
                  Тексты этого уровня появятся позже.
                </div>
              )}
            </section>
          )
        })}
      </div>
    </PageShell>
  )
}

function toTextCategory(level: string): TextCategory {
  const normalized = level.trim().toLocaleUpperCase('en')
  if (normalized.startsWith('A2')) return 'A2'
  if (normalized.startsWith('B1')) return 'B1'
  if (normalized.startsWith('B2')) return 'B2'
  return 'A1'
}

function formatTextCount(count: number): string {
  if (count === 1) return '1 текст'
  if (count > 1 && count < 5) return `${count} текста`
  return `${count} текстов`
}

function PageState({
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
