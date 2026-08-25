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
      className="border-b-0 pb-0 [&_h1]:text-2xl sm:[&_h1]:text-4xl"
    >
      <nav
        className="mt-3 flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg bg-muted/35 p-1 sm:mt-5"
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
                  ? 'bg-accent text-foreground shadow-xs'
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
