import {
  ChevronDownIcon,
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
  playbackRate,
  playbackState,
  segmentCount,
  onNext,
  onPlaybackRateChange,
  onPrevious,
  onToggle,
}: {
  available: boolean
  currentSegmentIndex: number
  playbackRate: number
  playbackState: AudioPlaybackState
  segmentCount: number
  onNext: () => void
  onPlaybackRateChange: (playbackRate: number) => void
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
        className="pointer-events-auto mx-auto grid w-fit max-w-full grid-cols-[4rem_auto_4rem] items-center gap-1 rounded-2xl border border-border/80 bg-card/95 p-2 shadow-lg backdrop-blur-xl"
        data-text-audio-controls
        role="group"
      >
        <div
          className="relative h-9 w-16 rounded-xl border border-border/70 bg-muted/50 text-muted-foreground transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30"
          data-text-audio-rate
        >
          <select
            aria-label="Скорость воспроизведения"
            className="absolute inset-0 size-full appearance-none rounded-xl border-0 bg-transparent py-0 pr-5 pl-2 text-center text-xs font-semibold tabular-nums outline-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!available}
            onChange={(event) =>
              onPlaybackRateChange(Number(event.target.value))
            }
            value={playbackRate}
          >
            <option value={0.75}>0.75×</option>
            <option value={1}>1×</option>
            <option value={1.25}>1.25×</option>
            <option value={1.5}>1.5×</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-1.5 size-3 -translate-y-1/2" />
        </div>
        <div
          className="flex items-center justify-center gap-1"
          data-text-audio-navigation
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
        </div>
        <span
          aria-live="polite"
          className="inline-flex h-9 w-16 items-center justify-center rounded-xl border border-border/70 bg-muted/50 px-2 text-center text-xs font-semibold tabular-nums text-muted-foreground"
          data-text-audio-position
        >
          {hasSegments ? boundedSegmentIndex + 1 : 0}/{segmentCount}
        </span>
      </div>
    </div>
  )
}
