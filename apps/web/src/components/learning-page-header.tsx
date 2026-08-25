import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface LearningPageHeaderProps {
  eyebrow: ReactNode
  title: string
  description?: string
  aside?: ReactNode
  children?: ReactNode
  className?: string
}

export function LearningPageHeader({
  eyebrow,
  title,
  description,
  aside,
  children,
  className,
}: LearningPageHeaderProps) {
  return (
    <header className={cn('border-b pb-5', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex min-h-5 items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            {eyebrow}
          </div>
          <h1 className="mt-1 max-w-3xl text-balance font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {aside ? <div className="w-full shrink-0 sm:w-64">{aside}</div> : null}
      </div>
      {children}
    </header>
  )
}
