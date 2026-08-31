import type { PreparedTextTokenResponse } from '@language/contracts'
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

import { getTextPlaybackSegments } from '@/lib/text-playback'

import { InteractiveText } from './texts_.$textId'

const reactActEnvironment = globalThis as {
  IS_REACT_ACT_ENVIRONMENT?: boolean
}

describe('interactive text audio', () => {
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
    vi.useRealTimers()
    vi.unstubAllGlobals()
    root = undefined
    container = undefined
  })

  it('plays a sentence without turning word clicks into audio clicks', async () => {
    const body = 'Minä olen opiskelija.'
    const onPlaySegment = vi.fn()
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(
        <InteractiveText
          activePlaybackSegment={null}
          addingItemId={undefined}
          addErrorItemId={undefined}
          body={body}
          onAdd={vi.fn()}
          onPlaySegment={onPlaySegment}
          playbackSegments={getTextPlaybackSegments(body)}
          tokens={[token('Minä', 0, 0, 4)]}
        />,
      )
    })

    await act(async () => {
      container
        ?.querySelector<HTMLButtonElement>('[data-word-trigger]')
        ?.click()
    })
    expect(onPlaySegment).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain('Начальная форма')

    act(() => {
      container
        ?.querySelector<HTMLElement>('[data-sentence-index="0"]')
        ?.click()
    })
    expect(onPlaySegment).toHaveBeenLastCalledWith(0)
    expect(
      container?.querySelector('[aria-label="Прослушать предложение 1"]'),
    ).toBeNull()
  })

  it('marks the active sentence', async () => {
    const body = 'Minä olen opiskelija.'
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(
        <InteractiveText
          activePlaybackSegment={0}
          addingItemId={undefined}
          addErrorItemId={undefined}
          body={body}
          onAdd={vi.fn()}
          onPlaySegment={vi.fn()}
          playbackSegments={getTextPlaybackSegments(body)}
          tokens={[token('Minä', 0, 0, 4)]}
        />,
      )
    })

    expect(
      container
        .querySelector<HTMLElement>('[data-sentence-index="0"]')
        ?.getAttribute('data-audio-active'),
    ).toBe('true')
    expect(
      container
        .querySelector<HTMLElement>('[data-word-trigger]')
        ?.getAttribute('data-audio-active'),
    ).toBeNull()
    expect(
      container.querySelector<HTMLElement>('[data-word-trigger]')?.className,
    ).not.toContain('bg-primary')
  })

  it('keeps only one mobile word translation open', async () => {
    const body = 'Minä olen.'
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(
        <InteractiveText
          activePlaybackSegment={null}
          addingItemId={undefined}
          addErrorItemId={undefined}
          body={body}
          onAdd={vi.fn()}
          onPlaySegment={vi.fn()}
          playbackSegments={getTextPlaybackSegments(body)}
          tokens={[
            token('Minä', 0, 0, 4, 'первый перевод'),
            token('olen', 1, 5, 9, 'второй перевод'),
          ]}
        />,
      )
    })

    await act(async () => {
      container
        ?.querySelectorAll<HTMLButtonElement>('[data-word-trigger]')[0]
        ?.click()
    })
    expect(
      document.querySelectorAll('[data-slot="popover-content"]'),
    ).toHaveLength(1)
    expect(
      document.querySelector('[data-slot="popover-content"]')?.textContent,
    ).toContain('первый перевод')

    await act(async () => {
      container
        ?.querySelectorAll<HTMLButtonElement>('[data-word-trigger]')[1]
        ?.click()
    })
    expect(
      Array.from(
        container?.querySelectorAll<HTMLButtonElement>('[data-word-trigger]') ??
          [],
      ).map((word) => word.getAttribute('aria-expanded')),
    ).toEqual(['false', 'true'])
    expect(
      document.querySelectorAll('[data-slot="popover-content"]'),
    ).toHaveLength(1)
    expect(
      document.querySelector('[data-slot="popover-content"]')?.textContent,
    ).toContain('второй перевод')
    expect(
      document.querySelector('[data-slot="popover-content"]')?.textContent,
    ).not.toContain('первый перевод')
  })

  it('starts sentence audio on a long press over a mobile word', async () => {
    vi.useFakeTimers()
    const body = 'Minä olen opiskelija.'
    const onPlaySegment = vi.fn()
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(
        <InteractiveText
          activePlaybackSegment={null}
          addingItemId={undefined}
          addErrorItemId={undefined}
          body={body}
          onAdd={vi.fn()}
          onPlaySegment={onPlaySegment}
          playbackSegments={getTextPlaybackSegments(body)}
          tokens={[token('Minä', 0, 0, 4)]}
        />,
      )
    })

    const word = container?.querySelector<HTMLButtonElement>(
      '[data-word-trigger]',
    )
    act(() => {
      word?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
      vi.advanceTimersByTime(450)
      word?.dispatchEvent(new Event('pointerup', { bubbles: true }))
      word?.click()
    })

    expect(onPlaySegment).toHaveBeenCalledOnce()
    expect(onPlaySegment).toHaveBeenCalledWith(0)
    expect(document.querySelector('[data-slot="popover-content"]')).toBeNull()
  })

  it('starts audio on every mobile sentence long press', async () => {
    vi.useFakeTimers()
    const body = 'Minä olen opiskelija.'
    const onPlaySegment = vi.fn()
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(
        <InteractiveText
          activePlaybackSegment={null}
          addingItemId={undefined}
          addErrorItemId={undefined}
          body={body}
          onAdd={vi.fn()}
          onPlaySegment={onPlaySegment}
          playbackSegments={getTextPlaybackSegments(body)}
          tokens={[token('Minä', 0, 0, 4)]}
        />,
      )
    })

    const sentence = container?.querySelector<HTMLElement>(
      '[data-sentence-index="0"]',
    )
    for (let index = 0; index < 2; index += 1) {
      act(() => {
        sentence?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
        vi.advanceTimersByTime(450)
        sentence?.dispatchEvent(new Event('pointerup', { bubbles: true }))
        sentence?.click()
      })
    }

    expect(onPlaySegment).toHaveBeenCalledTimes(2)
    expect(onPlaySegment).toHaveBeenNthCalledWith(1, 0)
    expect(onPlaySegment).toHaveBeenNthCalledWith(2, 0)
  })

  it('plays the word sentence on desktop click', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    )
    const body = 'Minä olen opiskelija.'
    const onPlaySegment = vi.fn()
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    await act(async () => {
      root?.render(
        <InteractiveText
          activePlaybackSegment={null}
          addingItemId={undefined}
          addErrorItemId={undefined}
          body={body}
          onAdd={vi.fn()}
          onPlaySegment={onPlaySegment}
          playbackSegments={getTextPlaybackSegments(body)}
          tokens={[token('Minä', 0, 0, 4)]}
        />,
      )
    })

    act(() => {
      container
        ?.querySelector<HTMLButtonElement>('[data-word-trigger]')
        ?.click()
    })

    expect(onPlaySegment).toHaveBeenCalledOnce()
    expect(onPlaySegment).toHaveBeenCalledWith(0)
    expect(
      container
        .querySelector<HTMLButtonElement>('[data-word-trigger]')
        ?.getAttribute('data-slot'),
    ).toBe('hover-card-trigger')
  })
})

function token(
  surface: string,
  position: number,
  charStart: number,
  charEnd: number,
  translation = 'я',
): PreparedTextTokenResponse {
  return {
    position,
    surface,
    lemma: surface.toLocaleLowerCase('fi'),
    translation: { ru: translation },
    analysis: { partOfSpeech: 'pronoun' },
    analyses: [],
    charStart,
    charEnd,
    dictionary: {
      gloss: { ru: translation },
      partOfSpeech: 'pronoun',
      forms: [],
    },
    lexical: null,
  }
}
