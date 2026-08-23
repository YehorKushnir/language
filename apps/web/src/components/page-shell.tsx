import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function PageShell({ className, ...props }: ComponentProps<'main'>) {
  return (
    <main
      data-app-page
      className={cn(
        'mx-auto w-full max-w-5xl px-4 py-8 sm:px-5 sm:py-10',
        className,
      )}
      {...props}
    />
  )
}
