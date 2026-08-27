import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createAudioPlayback,
  playAudio,
  stopActiveAudioPlayback,
} from './audio-playback'

describe('audio playback', () => {
  afterEach(() => {
    stopActiveAudioPlayback()
    vi.unstubAllGlobals()
  })

  it('stops the previous audio before activating another one', () => {
    const firstAudio = createAudioElement()
    const secondAudio = createAudioElement()
    vi.stubGlobal(
      'Audio',
      vi.fn().mockReturnValueOnce(firstAudio).mockReturnValueOnce(secondAudio),
    )

    createAudioPlayback('/first.mp3')
    createAudioPlayback('/second.mp3')

    expect(firstAudio.pause).toHaveBeenCalledOnce()
    expect(firstAudio.currentTime).toBe(0)
    expect(firstAudio.src).toBe('')
    expect(secondAudio.pause).not.toHaveBeenCalled()
  })

  it('starts automatic playback with the requested client-side rate', async () => {
    const audio = createAudioElement()
    vi.stubGlobal(
      'Audio',
      vi.fn(() => audio),
    )

    playAudio('/word.mp3', { playbackRate: 0.85 })
    await Promise.resolve()

    expect(audio.playbackRate).toBe(0.85)
    expect(audio.play).toHaveBeenCalledOnce()
  })
})

function createAudioElement() {
  return {
    addEventListener: vi.fn(),
    currentTime: 10,
    pause: vi.fn(),
    play: vi.fn().mockResolvedValue(undefined),
    playbackRate: 1,
    preload: '',
    src: 'initial',
  }
}
