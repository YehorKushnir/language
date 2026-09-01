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

export type AudioPlaybackState =
  'idle' | 'loading' | 'playing' | 'paused' | 'error'

type AudioStartTime = number | ((duration: number) => number)

export interface AudioButtonHandle {
  pause: () => void
  play: () => void
  playFrom: (startTime: AudioStartTime) => void
  seekTo: (startTime: AudioStartTime) => void
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
  renderControl?: boolean
  preparePlayback?: boolean
  playbackRate?: number
  onActivate?: () => void
  onPlaybackProgress?: (progress: AudioPlaybackProgress | null) => void
  onPlaybackStateChange?: (state: AudioPlaybackState) => void
}

export const AudioButton = forwardRef<AudioButtonHandle, AudioButtonProps>(
  function AudioButton(
    {
      src,
      label = 'Прослушать',
      className,
      compact = false,
      renderControl = true,
      preparePlayback = false,
      playbackRate = 1,
      onActivate,
      onPlaybackProgress,
      onPlaybackStateChange,
    },
    ref,
  ) {
    const [state, setState] = useState<AudioPlaybackState>('idle')
    const playbackRef = useRef<AudioPlayback | null>(null)
    const seekPlaybackRef = useRef<{
      playback: AudioPlayback
      seek: (startTime: AudioStartTime) => boolean
    } | null>(null)
    const playbackRateRef = useRef(playbackRate)
    const createPlaybackRef = useRef<
      ((startTime?: AudioStartTime) => AudioPlayback) | null
    >(null)
    const operationRef = useRef(0)

    useEffect(
      () => () => {
        playbackRef.current?.stop()
        playbackRef.current = null
        seekPlaybackRef.current = null
      },
      [],
    )

    useEffect(() => {
      operationRef.current += 1
      playbackRef.current?.stop()
      playbackRef.current = null
      seekPlaybackRef.current = null
      setState('idle')
    }, [src])

    useEffect(() => {
      playbackRateRef.current = playbackRate
      if (playbackRef.current) {
        playbackRef.current.audio.playbackRate = playbackRate
      }
    }, [playbackRate])

    useEffect(() => {
      onPlaybackStateChange?.(state)
    }, [onPlaybackStateChange, state])

    function createPlayback(startTime: AudioStartTime = 0) {
      let pendingStartTime: AudioStartTime | null = startTime
      const playback = createAudioPlayback(src!, {
        playbackRate: playbackRateRef.current,
        onStop: () => {
          if (playbackRef.current !== playback) return
          playbackRef.current = null
          seekPlaybackRef.current = null
          setState('idle')
          onPlaybackProgress?.(null)
        },
      })
      const { audio } = playback
      playbackRef.current = playback
      const reportProgress = () => {
        if (playbackRef.current !== playback) return
        if (!Number.isFinite(audio.currentTime) || audio.currentTime < 0) return
        if (Number.isNaN(audio.duration) || audio.duration <= 0) return
        onPlaybackProgress?.({
          currentTime: audio.currentTime,
          duration: audio.duration,
        })
      }
      const seek = () => {
        if (playbackRef.current !== playback) return false
        if (pendingStartTime === null) return true
        const requestedTime =
          typeof pendingStartTime === 'function'
            ? Number.isFinite(audio.duration) && audio.duration > 0
              ? pendingStartTime(audio.duration)
              : null
            : pendingStartTime
        if (requestedTime === null || !Number.isFinite(requestedTime)) {
          return false
        }
        const boundedStartTime =
          Number.isFinite(audio.duration) && audio.duration > 0
            ? Math.min(
                Math.max(requestedTime, 0),
                Math.max(audio.duration - 0.01, 0),
              )
            : Math.max(requestedTime, 0)
        try {
          audio.currentTime = boundedStartTime
          const seekApplied =
            Math.abs(audio.currentTime - boundedStartTime) <= 0.25 &&
            (typeof audio.readyState !== 'number' || audio.readyState >= 1)
          if (seekApplied) pendingStartTime = null
          return seekApplied
        } catch {
          return false
        }
      }
      const seekTo = (nextStartTime: AudioStartTime) => {
        pendingStartTime = nextStartTime
        const seekApplied = seek()
        if (seekApplied) reportProgress()
        return seekApplied
      }
      seekPlaybackRef.current = { playback, seek: seekTo }
      const handleMediaProgress = () => {
        if (pendingStartTime !== null && !seek()) return
        reportProgress()
      }
      seekTo(startTime)
      for (const event of [
        'loadedmetadata',
        'durationchange',
        'loadeddata',
        'canplay',
        'playing',
        'seeked',
        'progress',
        'timeupdate',
      ]) {
        audio.addEventListener(event, handleMediaProgress)
      }
      audio.addEventListener(
        'ended',
        () => {
          if (playbackRef.current !== playback) return
          playbackRef.current = null
          seekPlaybackRef.current = null
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
          seekPlaybackRef.current = null
          setState('error')
          onPlaybackProgress?.(null)
        },
        { once: true },
      )

      return playback
    }

    createPlaybackRef.current = createPlayback

    useEffect(() => {
      if (!src || !preparePlayback) return
      createPlaybackRef.current?.()
    }, [preparePlayback, src])

    async function startPlayback(playback: AudioPlayback) {
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
      onActivate?.()
      const existingPlayback = playbackRef.current
      const seekPlayback = seekPlaybackRef.current
      if (existingPlayback && seekPlayback?.playback === existingPlayback) {
        seekPlayback.seek(startTime)
        void startPlayback(existingPlayback)
        return
      }
      const playback = createPlayback(startTime)
      void startPlayback(playback)
    }

    function play() {
      if (!src) return
      onActivate?.()
      const playback = playbackRef.current ?? createPlayback()
      void startPlayback(playback)
    }

    function seekTo(startTime: AudioStartTime) {
      if (!src) return
      onActivate?.()
      const existingPlayback = playbackRef.current
      const seekPlayback = seekPlaybackRef.current
      if (existingPlayback && seekPlayback?.playback === existingPlayback) {
        seekPlayback.seek(startTime)
        return
      }
      createPlayback(startTime)
    }

    function pause() {
      const playback = playbackRef.current
      if (!playback || (state !== 'loading' && state !== 'playing')) return
      operationRef.current += 1
      playback.pause()
      setState('paused')
    }

    useImperativeHandle(ref, () => ({ pause, play, playFrom, seekTo }))

    function toggle() {
      if (!src) return
      const playback = playbackRef.current
      if (playback && (state === 'loading' || state === 'playing')) {
        pause()
        return
      }
      play()
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

    if (!renderControl) return null

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
