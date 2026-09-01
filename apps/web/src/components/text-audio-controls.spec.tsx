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

import { TextAudioControls } from './text-audio-controls'

const reactActEnvironment = globalThis as {
  IS_REACT_ACT_ENVIRONMENT?: boolean
}

describe('TextAudioControls', () => {
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
  })

  it('keeps sentence navigation and one play/pause control fixed above tooltips', () => {
    const handlers = {
      onNext: vi.fn(),
      onPlaybackRateChange: vi.fn(),
      onPrevious: vi.fn(),
      onSeek: vi.fn(),
      onToggle: vi.fn(),
    }
    const testContainer = document.createElement('div')
    container = testContainer
    document.body.append(testContainer)
    root = createRoot(testContainer)

    act(() => {
      root?.render(
        <TextAudioControls
          available
          currentSegmentIndex={1}
          currentTime={12}
          duration={90}
          playbackRate={1}
          playbackState="playing"
          segmentCount={3}
          {...handlers}
        />,
      )
    })

    const controls = testContainer.querySelector<HTMLElement>(
      '[data-text-audio-controls]',
    )
    expect(controls?.parentElement?.className).toContain('fixed')
    expect(controls?.parentElement?.className).toContain('z-[60]')
    expect(controls?.querySelector('[data-text-audio-track]')).not.toBeNull()
    expect(
      controls?.querySelector('[data-text-audio-rate]')?.className,
    ).toContain('h-9 w-[4.5rem]')
    expect(
      controls?.querySelector('[data-text-audio-position]')?.className,
    ).toContain('h-9 w-[4.5rem]')
    expect(controls?.textContent).toContain('2/3')
    expect(
      testContainer.querySelector<HTMLButtonElement>(
        '[aria-label="Поставить аудио на паузу"]',
      )?.disabled,
    ).toBe(false)
    expect(
      testContainer.querySelector('[aria-label="Запустить аудио"]'),
    ).toBeNull()
    const speed = testContainer.querySelector<HTMLSelectElement>(
      '[aria-label="Скорость воспроизведения"]',
    )
    expect(speed?.value).toBe('1')
    const track = testContainer.querySelector<HTMLInputElement>(
      '[aria-label="Аудиодорожка текста"]',
    )
    expect(track?.value).toBe('12')
    expect(track?.max).toBe('90')

    act(() => {
      testContainer
        .querySelector<HTMLButtonElement>(
          '[aria-label="Предыдущее предложение"]',
        )
        ?.click()
      if (speed) {
        speed.value = '1.25'
        speed.dispatchEvent(new Event('change', { bubbles: true }))
      }
      if (track) {
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          'value',
        )?.set?.call(track, '30')
        track.dispatchEvent(new Event('input', { bubbles: true }))
      }
      testContainer
        .querySelector<HTMLButtonElement>(
          '[aria-label="Поставить аудио на паузу"]',
        )
        ?.click()
      testContainer
        .querySelector<HTMLButtonElement>(
          '[aria-label="Следующее предложение"]',
        )
        ?.click()
    })

    expect(handlers.onPrevious).toHaveBeenCalledOnce()
    expect(handlers.onToggle).toHaveBeenCalledOnce()
    expect(handlers.onNext).toHaveBeenCalledOnce()
    expect(handlers.onPlaybackRateChange).toHaveBeenCalledWith(1.25)
    expect(handlers.onSeek).toHaveBeenCalledWith(30)
  })
})
