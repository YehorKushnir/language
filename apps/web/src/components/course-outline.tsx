import type {
  CourseOverviewResponse,
  CourseProgressResponse,
  LessonPart,
  LessonProgressResponse,
} from '@language/contracts'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  BookOpenIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleIcon,
  DumbbellIcon,
  LanguagesIcon,
  LockIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { Progress } from '@/components/ui/progress'
import { localizedText } from '@/lib/localized-text'
import { cn } from '@/lib/utils'
import {
  shouldAnimateNavigation,
  startAppViewTransition,
} from '@/lib/view-transition'

interface CourseOutlineProps {
  course: CourseOverviewResponse
  progress?: CourseProgressResponse
  selectedLessonId?: string
}

const firstModuleLessons = [
  'Личные местоимения и olla',
  'Настоящее время: глаголы первого типа',
  'Отрицание, вопросы и порядок слов',
  'Глаголы второго и третьего типов',
  'Глаголы четвёртого, пятого и шестого типов',
  'Чередование согласных в глаголах',
  'A-инфинитив и цепочки глаголов',
  'Генитив, принадлежность и minulla on',
  'Существительные и чередование согласных',
  'Образование партитива',
  'Основные случаи партитива',
  'Внутренние местные падежи',
  'Внешние местные падежи',
  'T-множественное и согласование',
  'Утвердительный имперфект',
  'Отрицание и вопросы в прошлом',
]

const modules = [
  { title: 'Каркас финского', level: 'A1' },
  { title: 'Система существительных', level: 'A1–A2' },
  { title: 'Система глаголов', level: 'A2' },
  { title: 'Устройство предложения', level: 'A2–B1' },
  { title: 'Продвинутая грамматика', level: 'B1–B2' },
]

const partLinks = [
  {
    part: 'explanation',
    label: 'Объяснение',
    icon: BookOpenIcon,
    to: '/lessons/$lessonId/explanation',
  },
  {
    part: 'vocabulary',
    label: 'Слова',
    icon: LanguagesIcon,
    to: '/lessons/$lessonId/vocabulary',
  },
  {
    part: 'practice',
    label: 'Практика',
    icon: DumbbellIcon,
    to: '/lessons/$lessonId/practice',
  },
] as const

export function CourseOutline({
  course,
  progress,
  selectedLessonId,
}: CourseOutlineProps) {
  const navigate = useNavigate()
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(
    selectedLessonId ?? null,
  )
  const routeLessons = course.route?.lessons ?? []
  const lessonsByPosition = new Map(
    routeLessons.map((lesson) => [
      `${lesson.modulePosition}:${lesson.lessonPosition}`,
      lesson,
    ]),
  )
  const progressByLesson = new Map(
    progress?.lessons.map((lesson) => [lesson.lessonId, lesson]) ?? [],
  )

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setExpandedLessonId(selectedLessonId ?? null)
    })
    return () => cancelAnimationFrame(frame)
  }, [selectedLessonId])

  function toggleLesson(lessonId: string) {
    if (expandedLessonId === lessonId) {
      setExpandedLessonId(null)
      window.setTimeout(() => {
        void navigate({ to: '/lessons' })
      }, 180)
      return
    }

    setExpandedLessonId(lessonId)
    window.setTimeout(() => {
      void navigate({
        to: '/lessons/$lessonId',
        params: { lessonId },
      })
    }, 180)
  }

  return (
    <div className="grid gap-9">
      {modules.map((module, moduleIndex) => (
        <section key={module.title}>
          <header className="flex items-baseline justify-between gap-4 border-b px-1 pb-3">
            <h2 className="font-serif text-xl font-semibold">
              {moduleIndex + 1}. {module.title}
            </h2>
            <span className="text-xs text-muted-foreground">
              {module.level} · 16 уроков
            </span>
          </header>

          <ol className="mt-3 grid gap-2">
            {Array.from({ length: 16 }, (_, lessonIndex) => {
              const lessonPosition = lessonIndex + 1
              const absolutePosition = moduleIndex * 16 + lessonPosition
              const lesson = lessonsByPosition.get(
                `${moduleIndex + 1}:${lessonPosition}`,
              )
              const lessonProgress = lesson
                ? progressByLesson.get(lesson.id)
                : undefined
              const isExpanded = lesson?.id === expandedLessonId
              const isAvailable = Boolean(lesson)
              const title = lesson
                ? localizedText(lesson.title)
                : moduleIndex === 0
                  ? firstModuleLessons[lessonIndex]
                  : `Урок ${absolutePosition}`

              return (
                <li
                  key={absolutePosition}
                  className={cn(
                    'overflow-hidden rounded-xl border bg-card transition-[border-color,box-shadow] duration-200',
                    isExpanded && 'border-primary/30 shadow-sm',
                  )}
                >
                  <button
                    type="button"
                    className={cn(
                      'flex min-h-14 w-full items-center gap-3.5 px-4 py-3 text-left transition-colors sm:px-5',
                      isAvailable
                        ? 'hover:bg-muted/45'
                        : 'cursor-default text-muted-foreground/65',
                    )}
                    disabled={!lesson}
                    aria-expanded={isAvailable ? isExpanded : undefined}
                    onClick={() => lesson && toggleLesson(lesson.id)}
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium tabular-nums text-muted-foreground">
                      {absolutePosition}
                    </span>
                    {lessonProgress?.completedAt ? (
                      <CheckIcon className="size-3.5 shrink-0 text-primary" />
                    ) : isAvailable ? (
                      <CircleIcon className="size-3.5 shrink-0 text-primary/55" />
                    ) : (
                      <LockIcon className="size-3.5 shrink-0 opacity-45" />
                    )}
                    <span
                      className="min-w-0 flex-1 text-[15px] font-medium leading-5 sm:text-base"
                      style={
                        isExpanded
                          ? { viewTransitionName: 'active-lesson-title' }
                          : undefined
                      }
                    >
                      {title}
                    </span>
                    {!isAvailable ? (
                      <span className="hidden text-xs sm:inline">Скоро</span>
                    ) : (
                      <ChevronDownIcon
                        className={cn(
                          'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                          isExpanded && 'rotate-180',
                        )}
                      />
                    )}
                  </button>

                  {lesson ? (
                    <div
                      className={cn(
                        'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
                        isExpanded
                          ? 'grid-rows-[1fr] opacity-100'
                          : 'grid-rows-[0fr] opacity-0',
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="border-t bg-background/45 px-4 py-4 sm:px-5 sm:pl-[4.75rem]">
                          <p className="mb-4 max-w-2xl text-sm leading-6 text-muted-foreground">
                            {localizedText(lesson.summary)}
                          </p>
                          <div className="grid gap-2 sm:grid-cols-3">
                            {partLinks.map((item) => {
                              const complete = isPartComplete(
                                lessonProgress,
                                item.part,
                              )
                              const Icon = item.icon
                              return (
                                <Link
                                  key={item.part}
                                  to={item.to}
                                  params={{ lessonId: lesson.id }}
                                  className="flex items-center justify-center gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent"
                                  onClick={(event) => {
                                    if (!shouldAnimateNavigation(event)) return
                                    event.preventDefault()
                                    startAppViewTransition(() =>
                                      navigate({
                                        to: item.to,
                                        params: { lessonId: lesson.id },
                                      }),
                                    )
                                  }}
                                >
                                  {complete ? (
                                    <CheckIcon className="size-3.5 text-primary" />
                                  ) : (
                                    <Icon className="size-3.5 text-muted-foreground" />
                                  )}
                                  {item.label}
                                </Link>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}

export function CourseOutlineSummary({
  completedLessons,
}: {
  completedLessons: number
}) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <Progress
        value={(completedLessons / 80) * 100}
        className="h-1.5 flex-1"
      />
      <span className="shrink-0 tabular-nums">{completedLessons} / 80</span>
    </div>
  )
}

function isPartComplete(
  progress: LessonProgressResponse | undefined,
  part: LessonPart,
) {
  if (part === 'explanation') return Boolean(progress?.explanationCompletedAt)
  if (part === 'vocabulary') return Boolean(progress?.vocabularyCompletedAt)
  return Boolean(progress?.practiceCompletedAt)
}
