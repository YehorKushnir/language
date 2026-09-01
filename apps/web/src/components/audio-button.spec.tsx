import { act, createRef } from 'react'
import { createRoot } from 'react-dom/client'
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { AudioButton, type AudioButtonHandle } from './audio-button'

const reactActEnvironment = globalThis as {
  IS_REACT_ACT_ENVIRONMENT?: boolean
}

describe('AudioButton', () => {
  let root: ReturnType<typeof createRoot> | undefined
  let container: HTMLDivElement | undefined

  beforeAll(() => {
    reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true
  })

  afterAll(() => {
    delete reactActEnvironment.IS_REACT_ACT_ENVIRONMENT
  })

  afterEach(() => {
    if (root) act(() => root?.unmount())
    container?.remove()
    root = undefined
    container = undefined
    vi.unstubAllGlobals()
  })

  it('changes the client-side playback rate without restarting audio', async () => {
    const listeners = new Map<string, EventListener>()
    const audio = {
      addEventListener: vi.fn((event: string, listener: EventListener) => {
        listeners.set(event, listener)
      }),
      currentTime: 0,
      duration: 20,
      pause: vi.fn(),
      play: vi.fn().mockResolvedValue(undefined),
      playbackRate: 1,
      preload: '',
      src: '',
    }
    const AudioConstructor = vi.fn(() => audio)
    const onPlaybackProgress = vi.fn()
    vi.stubGlobal('Audio', AudioConstructor)
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(
        <AudioButton
          label="Медленно"
          onPlaybackProgress={onPlaybackProgress}
          playbackRate={0.85}
          src="/api/v1/media/audio/test.mp3"
        />,
      )
    })
    await act(async () => {
      container?.querySelector('button')?.click()
      await Promise.resolve()
    })

    expect(AudioConstructor).toHaveBeenCalledWith(
      '/api/v1/media/audio/test.mp3',
    )
    expect(audio.playbackRate).toBe(0.85)
    expect(audio.play).toHaveBeenCalledOnce()

    audio.currentTime = 5
    act(() => listeners.get('timeupdate')?.(new Event('timeupdate')))
    expect(onPlaybackProgress).toHaveBeenLastCalledWith({
      currentTime: 5,
      duration: 20,
    })

    await act(async () => {
      root?.render(
        <AudioButton
          label="Медленно"
          onPlaybackProgress={onPlaybackProgress}
          playbackRate={1.25}
          src="/api/v1/media/audio/test.mp3"
        />,
      )
    })
    expect(audio.playbackRate).toBe(1.25)
    expect(audio.currentTime).toBe(5)
    expect(audio.pause).not.toHaveBeenCalled()
    expect(audio.play).toHaveBeenCalledOnce()

    act(() => container?.querySelector('button')?.click())
    expect(audio.pause).toHaveBeenCalledOnce()
    expect(audio.currentTime).toBe(5)
    expect(container?.textContent).toContain('Продолжить')

    await act(async () => {
      container?.querySelector('button')?.click()
      await Promise.resolve()
    })
    expect(audio.play).toHaveBeenCalledTimes(2)
    expect(audio.currentTime).toBe(5)
  })

  it('starts from a requested position in the shared audio file', async () => {
    const audio = {
      addEventListener: vi.fn(),
      currentTime: 0,
      duration: 100,
      pause: vi.fn(),
      play: vi.fn().mockResolvedValue(undefined),
      playbackRate: 1,
      preload: '',
      src: '',
    }
    vi.stubGlobal(
      'Audio',
      vi.fn(() => audio),
    )
    const audioButtonRef = createRef<AudioButtonHandle>()
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(
        <AudioButton
          ref={audioButtonRef}
          label="Обычная"
          src="/api/v1/media/audio/text.mp3"
        />,
      )
    })
    await act(async () => {
      audioButtonRef.current?.playFrom((duration) => duration * 0.4)
      await Promise.resolve()
    })

    expect(audio.currentTime).toBe(40)
    expect(audio.play).toHaveBeenCalledOnce()

    await act(async () => {
      audioButtonRef.current?.playFrom((duration) => duration * 0.2)
      await Promise.resolve()
    })
    expect(audio.currentTime).toBe(20)
    expect(audio.play).toHaveBeenCalledTimes(2)
    expect(audio.pause).not.toHaveBeenCalled()

    act(() => audioButtonRef.current?.pause())
    expect(audio.pause).toHaveBeenCalledOnce()

    await act(async () => {
      audioButtonRef.current?.play()
      await Promise.resolve()
    })
    expect(audio.play).toHaveBeenCalledTimes(3)
  })

  it('applies an exact position after mobile metadata loads with an infinite duration', async () => {
    const listeners = new Map<string, EventListener>()
    let canSeek = false
    let currentTime = 0
    const audio = {
      addEventListener: vi.fn((event: string, listener: EventListener) => {
        listeners.set(event, listener)
      }),
      get currentTime() {
        return currentTime
      },
      set currentTime(value: number) {
        if (canSeek) currentTime = value
      },
      duration: Number.POSITIVE_INFINITY,
      pause: vi.fn(),
      play: vi.fn().mockResolvedValue(undefined),
      playbackRate: 1,
      preload: '',
      get readyState() {
        return canSeek ? 2 : 0
      },
      src: '',
    }
    const AudioConstructor = vi.fn(() => audio)
    vi.stubGlobal('Audio', AudioConstructor)
    const onPlaybackProgress = vi.fn()
    const audioButtonRef = createRef<AudioButtonHandle>()
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(
        <AudioButton
          ref={audioButtonRef}
          onPlaybackProgress={onPlaybackProgress}
          renderControl={false}
          src="/api/v1/media/audio/text.mp3"
        />,
      )
    })
    await act(async () => {
      audioButtonRef.current?.playFrom(32)
      await Promise.resolve()
    })
    expect(currentTime).toBe(0)
    expect(audio.play).toHaveBeenCalledOnce()

    act(() => listeners.get('loadedmetadata')?.(new Event('loadedmetadata')))
    expect(currentTime).toBe(0)

    canSeek = true
    act(() => listeners.get('canplay')?.(new Event('canplay')))

    expect(currentTime).toBe(32)
    expect(onPlaybackProgress).toHaveBeenLastCalledWith({
      currentTime: 32,
      duration: Number.POSITIVE_INFINITY,
    })

    await act(async () => {
      audioButtonRef.current?.playFrom(64)
      await Promise.resolve()
    })

    expect(currentTime).toBe(64)
    expect(audio.play).toHaveBeenCalledTimes(2)
    expect(audio.pause).not.toHaveBeenCalled()
    expect(AudioConstructor).toHaveBeenCalledOnce()
  })
})
