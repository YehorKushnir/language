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

      {texts.data.items.length === 0 ? (
        <section className="mt-6 rounded-xl bg-muted/25 p-6 text-center">
          <h2 className="text-sm font-semibold">Текстов пока нет</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Новые тексты появятся здесь позже.
          </p>
        </section>
      ) : null}

      <div className="mt-7 grid min-w-0 gap-9">
        {textCategories.map((category) => {
          const categoryTexts = textsByCategory.get(category.level) ?? []
          if (categoryTexts.length === 0) return null

          return (
            <section key={category.level} className="min-w-0">
              <header className="flex items-baseline justify-between gap-4 px-1 pb-1">
                <h2 className="font-serif text-xl font-semibold">
                  {category.level} · {category.title}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {formatTextCount(categoryTexts.length)}
                </span>
              </header>

              {categoryTexts.length > 0 ? (
                <ol className="mt-3 grid min-w-0 gap-2">
                  {categoryTexts.map((text, index) => (
                    <li key={text.id}>
                      <Link
                        to="/texts/$textId"
                        params={{ textId: text.id }}
                        aria-label={`Открыть ${localizedText(text.title)}`}
                        className="interactive-row group flex min-h-16 min-w-0 items-center gap-3 rounded-xl bg-card px-3 py-3 shadow-xs transition-[box-shadow,transform] duration-150 hover:shadow-sm active:scale-[0.998] sm:gap-3.5 sm:px-5"
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium tabular-nums text-muted-foreground">
                          {index + 1}
                        </span>
                        <FileTextIcon className="hidden size-4 shrink-0 text-primary/65 sm:block" />
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-[15px] font-medium leading-5 sm:text-base">
                            {localizedText(text.title)}
                          </h3>
                          <p className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                            <span>{text.wordCount} слов</span>
                            <span className="sm:hidden">
                              {text.knownPercent}% знакомых
                            </span>
                            {!text.isGrammarReady ? (
                              <span>грамматика ещё впереди</span>
                            ) : null}
                          </p>
                        </div>
                        <div className="hidden w-36 shrink-0 sm:block">
                          <Progress
                            className="h-1.5"
                            value={text.knownPercent}
                            aria-label={`Знакомые слова в тексте ${localizedText(text.title)}`}
                          />
                        </div>
                        <span className="hidden min-w-24 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground sm:block">
                          {text.knownPercent}% знакомых
                        </span>
                        <span className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-[background-color,color,transform] duration-150 group-hover:translate-x-0.5 group-hover:bg-secondary group-hover:text-primary sm:size-8">
                          <ArrowRightIcon className="size-4" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="mt-3 rounded-xl bg-muted/25 px-5 py-5 text-sm text-muted-foreground">
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
