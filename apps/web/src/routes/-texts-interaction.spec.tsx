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
): PreparedTextTokenResponse {
  return {
    position,
    surface,
    lemma: surface.toLocaleLowerCase('fi'),
    translation: { ru: 'я' },
    analysis: { partOfSpeech: 'pronoun' },
    analyses: [],
    charStart,
    charEnd,
    dictionary: {
      gloss: { ru: 'я' },
      partOfSpeech: 'pronoun',
      forms: [],
    },
    lexical: null,
  }
}
