import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderCircleIcon,
  PauseIcon,
  PlayIcon,
} from 'lucide-react'

import type { AudioPlaybackState } from '@/components/audio-button'
import { Button } from '@/components/ui/button'

export function TextAudioControls({
  available,
  currentSegmentIndex,
  playbackState,
  segmentCount,
  onNext,
  onPrevious,
  onToggle,
}: {
  available: boolean
  currentSegmentIndex: number
  playbackState: AudioPlaybackState
  segmentCount: number
  onNext: () => void
  onPrevious: () => void
  onToggle: () => void
}) {
  const isStarting = playbackState === 'loading'
  const isPlaying = playbackState === 'playing'
  const hasSegments = segmentCount > 0
  const boundedSegmentIndex = hasSegments
    ? Math.min(Math.max(currentSegmentIndex, 0), segmentCount - 1)
    : 0

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-[60] px-3 lg:bottom-5 lg:px-5">
      <div
        aria-label="Управление аудио текста"
        className="pointer-events-auto mx-auto flex w-fit max-w-full items-center gap-1 rounded-2xl border border-border/80 bg-card/95 p-2 shadow-lg backdrop-blur-xl"
        data-text-audio-controls
        role="group"
      >
        <Button
          aria-label="Предыдущее предложение"
          disabled={!available || !hasSegments || boundedSegmentIndex === 0}
          onClick={onPrevious}
          size="icon"
          type="button"
          variant="ghost"
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          aria-label={
            isPlaying || isStarting
              ? 'Поставить аудио на паузу'
              : playbackState === 'paused'
                ? 'Продолжить аудио'
                : 'Запустить аудио'
          }
          aria-busy={isStarting}
          className="rounded-full"
          data-text-audio-toggle
          disabled={!available}
          onClick={onToggle}
          size="icon"
          type="button"
        >
          {isStarting ? (
            <LoaderCircleIcon className="animate-spin" />
          ) : isPlaying ? (
            <PauseIcon />
          ) : (
            <PlayIcon />
          )}
        </Button>
        <Button
          aria-label="Следующее предложение"
          disabled={
            !available ||
            !hasSegments ||
            boundedSegmentIndex >= segmentCount - 1
          }
          onClick={onNext}
          size="icon"
          type="button"
          variant="ghost"
        >
          <ChevronRightIcon />
        </Button>
        <span
          aria-live="polite"
          className="min-w-12 px-1 text-center text-xs tabular-nums text-muted-foreground"
        >
          {hasSegments ? boundedSegmentIndex + 1 : 0}/{segmentCount}
        </span>
      </div>
    </div>
  )
}
