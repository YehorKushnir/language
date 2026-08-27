import {
  LoaderCircleIcon,
  SquareIcon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { createAudioPlayback, type AudioPlayback } from '@/lib/audio-playback'
import { cn } from '@/lib/utils'

type PlaybackState = 'idle' | 'loading' | 'playing' | 'error'

export interface AudioPlaybackProgress {
  currentTime: number
  duration: number
}

export function AudioButton({
  src,
  label = 'Прослушать',
  className,
  compact = false,
  playbackRate = 1,
  onPlaybackProgress,
}: {
  src: string | null | undefined
  label?: string
  className?: string
  compact?: boolean
  playbackRate?: number
  onPlaybackProgress?: (progress: AudioPlaybackProgress | null) => void
}) {
  const [state, setState] = useState<PlaybackState>('idle')
  const playbackRef = useRef<AudioPlayback | null>(null)

  function stop() {
    playbackRef.current?.stop()
    playbackRef.current = null
    setState('idle')
  }

  useEffect(
    () => () => {
      playbackRef.current?.stop()
      playbackRef.current = null
    },
    [],
  )

  useEffect(() => {
    playbackRef.current?.stop()
    playbackRef.current = null
  }, [playbackRate, src])

  async function toggle() {
    if (!src) return
    if (state === 'loading' || state === 'playing') {
      stop()
      return
    }

    const playback = createAudioPlayback(src, {
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
    setState('loading')
    const reportProgress = () => {
      if (playbackRef.current !== playback) return
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return
      onPlaybackProgress?.({
        currentTime: audio.currentTime,
        duration: audio.duration,
      })
    }
    audio.addEventListener('loadedmetadata', reportProgress)
    audio.addEventListener('timeupdate', reportProgress)
    audio.addEventListener(
      'playing',
      () => {
        if (playbackRef.current === playback) setState('playing')
      },
      { once: true },
    )
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
    try {
      await playback.play()
    } catch {
      if (playbackRef.current !== playback) return
      playback.stop()
      setState('error')
    }
  }

  const unavailable = !src
  const buttonLabel = unavailable
    ? 'Аудио недоступно'
    : state === 'playing'
      ? 'Остановить'
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
        <SquareIcon />
      ) : (
        <Volume2Icon />
      )}
      {compact ? <span className="sr-only">{buttonLabel}</span> : buttonLabel}
    </Button>
  )
}
