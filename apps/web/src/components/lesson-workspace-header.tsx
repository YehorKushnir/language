import type { LessonPart } from '@language/contracts'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeftIcon,
  BookOpenIcon,
  DumbbellIcon,
  LanguagesIcon,
} from 'lucide-react'

import { LearningPageHeader } from '@/components/learning-page-header'
import { cn } from '@/lib/utils'
import {
  shouldAnimateNavigation,
  startAppViewTransition,
} from '@/lib/view-transition'

interface LessonWorkspaceHeaderProps {
  lessonId: string
  lessonTitle: string
  lessonSummary: string
  activePart: LessonPart
}

const parts = [
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

export function LessonWorkspaceHeader({
  lessonId,
  lessonTitle,
  lessonSummary,
  activePart,
}: LessonWorkspaceHeaderProps) {
  const navigate = useNavigate()
  const activeLabel = parts.find((item) => item.part === activePart)?.label

  return (
    <LearningPageHeader
      eyebrow={
        <>
          <Link
            to="/lessons/$lessonId"
            params={{ lessonId }}
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            onClick={(event) => {
              if (!shouldAnimateNavigation(event)) return
              event.preventDefault()
              startAppViewTransition(() =>
                navigate({
                  to: '/lessons/$lessonId',
                  params: { lessonId },
                }),
              )
            }}
          >
            <ArrowLeftIcon className="size-3.5" /> Все уроки
          </Link>
          <span className="text-border">/</span>
          <span>{activeLabel}</span>
        </>
      }
      title={lessonTitle}
      description={lessonSummary}
      transitionTitle
    >
      <nav className="mt-5 flex gap-1 overflow-x-auto" aria-label="Части урока">
        {parts.map((item) => {
          const Icon = item.icon
          const active = item.part === activePart
          return (
            <Link
              key={item.part}
              to={item.to}
              params={{ lessonId }}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              onClick={(event) => {
                if (active || !shouldAnimateNavigation(event)) return
                event.preventDefault()
                startAppViewTransition(() =>
                  navigate({
                    to: item.to,
                    params: { lessonId },
                  }),
                )
              }}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </LearningPageHeader>
  )
}
