import type { LessonPart } from '@language/contracts'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeftIcon,
  BookOpenIcon,
  DumbbellIcon,
  LanguagesIcon,
} from 'lucide-react'

import { LearningPageHeader } from '@/components/learning-page-header'
import { cn } from '@/lib/utils'

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
  const activeLabel = parts.find((item) => item.part === activePart)?.label

  return (
    <LearningPageHeader
      eyebrow={
        <>
          <Link
            to="/lessons"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" /> Все уроки
          </Link>
          <span className="text-border">/</span>
          <span>{activeLabel}</span>
        </>
      }
      title={lessonTitle}
      description={lessonSummary}
    >
      <nav
        className="mt-5 flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg bg-muted/35 p-1"
        aria-label="Части урока"
      >
        {parts.map((item) => {
          const Icon = item.icon
          const active = item.part === activePart
          return (
            <Link
              key={item.part}
              to={item.to}
              params={{ lessonId }}
              resetScroll={false}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-[color,background-color,transform] duration-150 active:scale-[0.98]',
                active
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
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
