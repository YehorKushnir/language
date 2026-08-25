import type {
  CourseOverviewResponse,
  LessonPart,
  LessonProgressResponse,
  PreparedTextSummaryResponse,
} from '@language/contracts'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRightIcon,
  BookOpenIcon,
  BrainIcon,
  CheckIcon,
  CircleIcon,
  DumbbellIcon,
  LanguagesIcon,
  ScrollTextIcon,
} from 'lucide-react'

import {
  courseProgressQuery,
  courseQuery,
  preparedTextsQuery,
} from '@/api/queries'
import { preloadCourseRoute } from '@/api/route-preload'
import { LearningPageHeader } from '@/components/learning-page-header'
import { PageShell } from '@/components/page-shell'
import { PageLoading, QueryError } from '@/components/query-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { authClient } from '@/lib/auth-client'
import {
  getCompletedLessonPartCount,
  getNextLessonPart,
  isLessonPartComplete,
} from '@/lib/home-progress'
import { localizedText } from '@/lib/localized-text'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    preloadCourseRoute(context.queryClient, (routeVersionId, queryClient) =>
      Promise.all([
        queryClient.ensureQueryData(courseProgressQuery(routeVersionId)),
        queryClient.ensureQueryData(preparedTextsQuery(routeVersionId)),
      ]),
    ),
  component: HomePage,
})

const continuationByPart = {
  explanation: {
    label: 'Открыть объяснение',
    to: '/lessons/$lessonId/explanation',
  },
  vocabulary: {
    label: 'Продолжить со словами',
    to: '/lessons/$lessonId/vocabulary',
  },
  practice: {
    label: 'Перейти к практике',
    to: '/lessons/$lessonId/practice',
  },
} as const

const lessonPartItems = [
  { part: 'explanation', label: 'Объяснение', icon: BookOpenIcon },
  { part: 'vocabulary', label: 'Слова', icon: LanguagesIcon },
  { part: 'practice', label: 'Практика', icon: DumbbellIcon },
] as const

function HomePage() {
  const session = authClient.useSession()
  const course = useQuery(courseQuery)
  const routeVersionId = course.data?.route?.id ?? ''
  const progress = useQuery({
    ...courseProgressQuery(routeVersionId),
    enabled: Boolean(routeVersionId && session.data),
  })
  const texts = useQuery({
    ...preparedTextsQuery(routeVersionId),
    enabled: Boolean(routeVersionId && session.data),
  })

  if (course.isPending || session.isPending) return <PageState loading />
  if (course.isError) return <PageState message={course.error.message} />
  if (!session.data) return <GuestHome course={course.data} />
  if (progress.isPending || texts.isPending) return <PageState loading />
  if (progress.isError || texts.isError) {
    return <PageState message={(progress.error ?? texts.error)?.message} />
  }

  const routeLessons = course.data.route?.lessons ?? []
  const currentLessonId =
    progress.data.currentLessonId ?? routeLessons[0]?.id ?? null
  const currentLesson = routeLessons.find(
    (lesson) => lesson.id === currentLessonId,
  )
  const currentLessonProgress = progress.data.lessons.find(
    (lesson) => lesson.lessonId === currentLessonId,
  )
  const completedParts = getCompletedLessonPartCount(currentLessonProgress)
  const nextPart = getNextLessonPart(currentLessonProgress)
  const continuation = continuationByPart[nextPart]
  const totalLessons = progress.data.totalLessons || routeLessons.length
  const coursePercent = totalLessons
    ? (progress.data.completedLessons / totalLessons) * 100
    : 0
  const recommendedText = texts.data.items.find(
    (text) => text.id === texts.data.recommendedTextId,
  )
  const firstName = session.data.user.name.trim().split(/\s+/u)[0]

  return (
    <PageShell className="py-7 sm:py-9">
      <LearningPageHeader
        eyebrow={`${localizedText(course.data.title)} · модуль 1`}
        title={
          firstName ? `С возвращением, ${firstName}` : 'Продолжаем финский'
        }
        description={getHomeSummary(
          progress.data.dueReviews,
          currentLesson ? localizedText(currentLesson.title) : null,
        )}
      />

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.75fr)]">
        {currentLesson && currentLessonId ? (
          <Link
            to={continuation.to}
            params={{ lessonId: currentLessonId }}
            className="interactive-surface group flex min-h-64 flex-col rounded-xl border bg-card p-5 shadow-xs sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Следующий шаг
              </span>
              <Badge variant="secondary">
                Урок {getAbsoluteLessonPosition(currentLesson)} из{' '}
                {totalLessons}
              </Badge>
            </div>

            <div className="mt-5 max-w-2xl">
              <h2 className="font-serif text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                {localizedText(currentLesson.title)}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                {localizedText(currentLesson.summary)}
              </p>
            </div>

            <div className="mt-auto pt-6">
              <LessonPartProgress
                activePart={nextPart}
                progress={currentLessonProgress}
              />
              <div className="mt-5 flex flex-col items-start gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span className="text-xs text-muted-foreground">
                  {completedParts} из 3 частей завершено
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {continuation.label}
                  <ArrowRightIcon className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <ReviewCard dueReviews={progress.data.dueReviews} />
          <ModuleProgressCard
            completedLessons={progress.data.completedLessons}
            currentLesson={currentLesson?.lessonPosition ?? 1}
            percent={coursePercent}
            totalLessons={totalLessons}
          />
        </div>
      </div>

      <section className="mt-7 border-t pt-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Чтение
            </p>
            <h2 className="mt-1 font-serif text-xl font-semibold">
              Подходящий текст
            </h2>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link to="/texts">Все тексты</Link>
          </Button>
        </div>
        <RecommendedTextCard text={recommendedText} />
      </section>
    </PageShell>
  )
}

function LessonPartProgress({
  activePart,
  progress,
}: {
  activePart: LessonPart
  progress: LessonProgressResponse | undefined
}) {
  return (
    <ol
      className="grid grid-cols-3 gap-1.5 sm:gap-2"
      aria-label="Прогресс текущего урока"
    >
      {lessonPartItems.map((item) => {
        const complete = isLessonPartComplete(progress, item.part)
        const active = item.part === activePart && !progress?.completedAt
        const Icon = item.icon

        return (
          <li
            key={item.part}
            aria-current={active ? 'step' : undefined}
            className={cn(
              'flex min-w-0 items-center justify-center rounded-lg border px-1.5 py-2 text-[11px] font-medium sm:justify-start sm:gap-2 sm:px-3 sm:text-xs',
              complete
                ? 'border-primary/20 bg-primary/8 text-primary'
                : active
                  ? 'border-primary/25 bg-secondary text-foreground'
                  : 'bg-background/60 text-muted-foreground',
            )}
          >
            <span className="sr-only">
              {complete
                ? 'Завершено: '
                : active
                  ? 'Текущий шаг: '
                  : 'Не начато: '}
            </span>
            {complete ? (
              <CheckIcon className="hidden size-3.5 shrink-0 sm:block" />
            ) : active ? (
              <CircleIcon className="hidden size-3.5 shrink-0 fill-primary/15 text-primary sm:block" />
            ) : (
              <Icon className="hidden size-3.5 shrink-0 sm:block" />
            )}
            <span className="truncate">{item.label}</span>
          </li>
        )
      })}
    </ol>
  )
}

function ReviewCard({ dueReviews }: { dueReviews: number }) {
  const hasReviews = dueReviews > 0

  return (
    <Link
      to={hasReviews ? '/reviews/session' : '/vocabulary'}
      className="interactive-surface group flex min-h-31 flex-col rounded-xl border bg-card p-4 shadow-xs"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-9 place-items-center rounded-lg bg-secondary text-primary">
          <BrainIcon className="size-4.5" />
        </span>
        <ArrowRightIcon className="size-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5" />
      </div>
      <div className="mt-auto pt-4">
        <p className="text-xs text-muted-foreground">Повторение</p>
        <h2 className="mt-0.5 text-base font-semibold">
          {hasReviews
            ? `${formatReviewCount(dueReviews)} на сегодня`
            : 'На сегодня всё'}
        </h2>
      </div>
    </Link>
  )
}

function ModuleProgressCard({
  completedLessons,
  currentLesson,
  percent,
  totalLessons,
}: {
  completedLessons: number
  currentLesson: number
  percent: number
  totalLessons: number
}) {
  return (
    <Link
      to="/lessons"
      className="interactive-surface group flex min-h-31 flex-col rounded-xl border bg-card p-4 shadow-xs"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Модуль 1 · A1</p>
          <h2 className="mt-0.5 text-base font-semibold">Каркас финского</h2>
        </div>
        <ArrowRightIcon className="size-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5" />
      </div>
      <div className="mt-auto pt-4">
        <div className="flex items-center gap-3">
          <Progress
            value={percent}
            className="h-1.5"
            aria-label="Прогресс первого модуля"
          />
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {completedLessons} / {totalLessons}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Сейчас урок {currentLesson}
        </p>
      </div>
    </Link>
  )
}

function RecommendedTextCard({
  text,
}: {
  text: PreparedTextSummaryResponse | undefined
}) {
  if (!text) {
    return (
      <Link
        to="/texts"
        className="interactive-surface mt-3 flex items-center gap-3 rounded-xl border bg-card px-4 py-4 shadow-xs"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
          <ScrollTextIcon className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium">
            Подходящий текст появится после контрольного урока
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Все тексты можно посмотреть уже сейчас.
          </span>
        </span>
        <ArrowRightIcon className="ml-auto size-4 text-muted-foreground" />
      </Link>
    )
  }

  return (
    <Link
      to="/texts/$textId"
      params={{ textId: text.id }}
      className="interactive-surface group mt-3 grid gap-4 rounded-xl border bg-card px-4 py-4 shadow-xs sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-5"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary max-sm:hidden">
        <ScrollTextIcon className="size-4.5" />
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold sm:text-base">
            {localizedText(text.title)}
          </span>
          <Badge variant="outline">{text.level}</Badge>
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">
          {text.wordCount} слов · знакомо {text.knownPercent}%
        </span>
      </span>
      <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
        Читать
        <ArrowRightIcon className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

function GuestHome({ course }: { course: CourseOverviewResponse }) {
  const firstLesson = course.route?.lessons[0]
  const lessonCount = course.route?.lessons.length ?? 0

  return (
    <PageShell className="py-7 sm:py-9">
      <LearningPageHeader
        eyebrow="Русский → финский"
        title={localizedText(course.title)}
        description={
          localizedText(course.description) ||
          'Последовательный курс грамматики, слов и практики.'
        }
        aside={
          <Button asChild className="w-full" size="sm">
            <Link to="/sign-up">
              Начать учиться <ArrowRightIcon />
            </Link>
          </Button>
        }
      />

      <section className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        <CourseFact value={lessonCount} label="уроков в первом модуле" />
        <CourseFact value="≈400" label="слов для изучения" />
        <CourseFact value={5} label="подготовленных текстов" />
      </section>

      {firstLesson ? (
        <section className="mt-6 rounded-xl border bg-card p-5 shadow-xs sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Первый урок
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold">
            {localizedText(firstLesson.title)}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {localizedText(firstLesson.summary)}
          </p>
          <Button asChild className="mt-5" size="sm" variant="outline">
            <Link to="/sign-up">Создать аккаунт и начать</Link>
          </Button>
        </section>
      ) : null}
    </PageShell>
  )
}

function CourseFact({
  value,
  label,
}: {
  value: number | string
  label: string
}) {
  return (
    <div className="rounded-xl border bg-card px-2.5 py-3 text-center shadow-xs sm:px-4 sm:py-4 sm:text-left">
      <p className="font-serif text-xl font-semibold text-primary sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-[11px] leading-4 text-muted-foreground sm:text-xs">
        {label}
      </p>
    </div>
  )
}

function getHomeSummary(dueReviews: number, lessonTitle: string | null) {
  if (dueReviews > 0) {
    return `${formatReviewCount(dueReviews)} ждут тренировки. После неё можно продолжить текущий урок.`
  }
  return lessonTitle
    ? `Повторений на сегодня нет. Следующий шаг — «${lessonTitle}».`
    : 'Повторений на сегодня нет. Можно выбрать следующий урок.'
}

function getAbsoluteLessonPosition(lesson: {
  modulePosition: number
  lessonPosition: number
}) {
  return (lesson.modulePosition - 1) * 16 + lesson.lessonPosition
}

function formatReviewCount(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100
  const noun =
    mod10 === 1 && mod100 !== 11
      ? 'повторение'
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? 'повторения'
        : 'повторений'
  return `${count} ${noun}`
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
