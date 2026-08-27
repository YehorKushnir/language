export interface AudioPlayback {
  audio: HTMLAudioElement
  play: () => Promise<void>
  stop: () => void
}

let activePlayback: AudioPlayback | undefined

export function stopActiveAudioPlayback() {
  activePlayback?.stop()
}

export function createAudioPlayback(
  src: string,
  {
    playbackRate = 1,
    onStop,
  }: {
    playbackRate?: number
    onStop?: () => void
  } = {},
): AudioPlayback {
  stopActiveAudioPlayback()

  const audio = new Audio(src)
  audio.preload = 'auto'
  audio.playbackRate = playbackRate
  let stopped = false

  const playback: AudioPlayback = {
    audio,
    play: async () => {
      await audio.play()
    },
    stop: () => {
      if (stopped) return
      stopped = true
      if (activePlayback === playback) activePlayback = undefined
      audio.pause()
      audio.currentTime = 0
      audio.src = ''
      onStop?.()
    },
  }

  const release = () => {
    if (activePlayback === playback) activePlayback = undefined
  }
  audio.addEventListener('ended', release, { once: true })
  audio.addEventListener('error', release, { once: true })
  activePlayback = playback

  return playback
}

export function playAudio(
  src: string,
  { playbackRate = 1 }: { playbackRate?: number } = {},
): AudioPlayback {
  const playback = createAudioPlayback(src, { playbackRate })
  void playback.play().catch(() => playback.stop())
  return playback
}
