import { act } from 'react'
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

import { AudioButton } from './audio-button'

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

  it('sets the requested client-side playback rate before playing', async () => {
    const audio = {
      addEventListener: vi.fn(),
      currentTime: 0,
      pause: vi.fn(),
      play: vi.fn().mockResolvedValue(undefined),
      playbackRate: 1,
      preload: '',
      src: '',
    }
    const AudioConstructor = vi.fn(() => audio)
    vi.stubGlobal('Audio', AudioConstructor)
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(
        <AudioButton
          label="Медленно"
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
  })
})
