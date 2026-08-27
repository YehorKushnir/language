import {
  LoaderCircleIcon,
  PauseIcon,
  PlayIcon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-react'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { Button } from '@/components/ui/button'
import { createAudioPlayback, type AudioPlayback } from '@/lib/audio-playback'
import { cn } from '@/lib/utils'

type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

type AudioStartTime = number | ((duration: number) => number)

export interface AudioButtonHandle {
  playFrom: (startTime: AudioStartTime) => void
}

export interface AudioPlaybackProgress {
  currentTime: number
  duration: number
}

interface AudioButtonProps {
  src: string | null | undefined
  label?: string
  className?: string
  compact?: boolean
  playbackRate?: number
  onPlaybackProgress?: (progress: AudioPlaybackProgress | null) => void
}

export const AudioButton = forwardRef<AudioButtonHandle, AudioButtonProps>(
  function AudioButton(
    {
      src,
      label = 'Прослушать',
      className,
      compact = false,
      playbackRate = 1,
      onPlaybackProgress,
    },
    ref,
  ) {
    const [state, setState] = useState<PlaybackState>('idle')
    const playbackRef = useRef<AudioPlayback | null>(null)
    const operationRef = useRef(0)

    useEffect(
      () => () => {
        playbackRef.current?.stop()
        playbackRef.current = null
      },
      [],
    )

    useEffect(() => {
      operationRef.current += 1
      playbackRef.current?.stop()
      playbackRef.current = null
      setState('idle')
    }, [playbackRate, src])

    function createPlayback(startTime: AudioStartTime = 0) {
      const playback = createAudioPlayback(src!, {
        playbackRate,
        onStop: () => {
          if (playbackRef.current !== playback) return
          playbackRef.current = null
          setState('idle')
          onPlaybackProgress?.(null)
        },
      })
      const { audio } = playback
      playbackRef.current = playback
      const reportProgress = () => {
        if (playbackRef.current !== playback) return
        if (!Number.isFinite(audio.duration) || audio.duration <= 0) return
        onPlaybackProgress?.({
          currentTime: audio.currentTime,
          duration: audio.duration,
        })
      }
      const seek = () => {
        if (playbackRef.current !== playback) return
        if (!Number.isFinite(audio.duration) || audio.duration <= 0) return
        const requestedTime =
          typeof startTime === 'function'
            ? startTime(audio.duration)
            : startTime
        if (!Number.isFinite(requestedTime)) return
        audio.currentTime = Math.min(
          Math.max(requestedTime, 0),
          Math.max(audio.duration - 0.01, 0),
        )
        reportProgress()
      }
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        seek()
      } else {
        audio.addEventListener('loadedmetadata', seek, { once: true })
      }
      audio.addEventListener('loadedmetadata', reportProgress)
      audio.addEventListener('timeupdate', reportProgress)
      audio.addEventListener(
        'ended',
        () => {
          if (playbackRef.current !== playback) return
          playbackRef.current = null
          setState('idle')
          onPlaybackProgress?.(null)
        },
        { once: true },
      )
      audio.addEventListener(
        'error',
        () => {
          if (playbackRef.current !== playback) return
          playbackRef.current = null
          setState('error')
          onPlaybackProgress?.(null)
        },
        { once: true },
      )

      return playback
    }

    async function play(playback: AudioPlayback) {
      const operation = ++operationRef.current
      setState('loading')
      try {
        await playback.play()
        if (
          playbackRef.current === playback &&
          operationRef.current === operation
        ) {
          setState('playing')
        }
      } catch {
        if (
          playbackRef.current !== playback ||
          operationRef.current !== operation
        ) {
          return
        }
        playback.stop()
        setState('error')
        onPlaybackProgress?.(null)
      }
    }

    function playFrom(startTime: AudioStartTime) {
      if (!src) return
      const existingPlayback = playbackRef.current
      const playback = existingPlayback ?? createPlayback(startTime)
      if (existingPlayback) {
        const { audio } = playback
        const seek = () => {
          if (!Number.isFinite(audio.duration) || audio.duration <= 0) return
          const requestedTime =
            typeof startTime === 'function'
              ? startTime(audio.duration)
              : startTime
          if (!Number.isFinite(requestedTime)) return
          audio.currentTime = Math.min(
            Math.max(requestedTime, 0),
            Math.max(audio.duration - 0.01, 0),
          )
          onPlaybackProgress?.({
            currentTime: audio.currentTime,
            duration: audio.duration,
          })
        }
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          seek()
        } else if (playbackRef.current === playback) {
          audio.addEventListener('loadedmetadata', seek, { once: true })
        }
      }
      void play(playback)
    }

    useImperativeHandle(ref, () => ({ playFrom }))

    function toggle() {
      if (!src) return
      const playback = playbackRef.current
      if (playback && (state === 'loading' || state === 'playing')) {
        operationRef.current += 1
        playback.pause()
        setState('paused')
        return
      }
      if (playback) {
        void play(playback)
        return
      }
      void play(createPlayback())
    }

    const unavailable = !src
    const buttonLabel = unavailable
      ? 'Аудио недоступно'
      : state === 'playing'
        ? 'Пауза'
        : state === 'paused'
          ? 'Продолжить'
          : state === 'error'
            ? 'Повторить'
            : label

    return (
      <Button
        aria-label={`${buttonLabel}${label ? `: ${label}` : ''}`}
        aria-busy={state === 'loading'}
        className={cn(compact && 'size-8 p-0', className)}
        disabled={unavailable}
        size="sm"
        type="button"
        variant="outline"
        onClick={toggle}
      >
        {unavailable ? (
          <VolumeXIcon />
        ) : state === 'loading' ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : state === 'playing' ? (
          <PauseIcon />
        ) : state === 'paused' ? (
          <PlayIcon />
        ) : (
          <Volume2Icon />
        )}
        {compact ? <span className="sr-only">{buttonLabel}</span> : buttonLabel}
      </Button>
    )
  },
)
