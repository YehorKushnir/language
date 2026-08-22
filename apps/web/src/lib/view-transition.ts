import type { MouseEvent } from 'react'

export function shouldAnimateNavigation(
  event: MouseEvent<HTMLAnchorElement>,
): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    event.currentTarget.target !== '_blank'
  )
}

export function startAppViewTransition(
  update: () => void | Promise<void>,
): void {
  const startViewTransition = document.startViewTransition?.bind(document)
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  if (!startViewTransition || reduceMotion) {
    void update()
    return
  }

  const transition = startViewTransition(update)
  void transition.finished.catch(() => undefined)
}
