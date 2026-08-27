import { describe, expect, it } from 'vitest'

import {
  getActiveTextPlaybackSegment,
  getTextPlaybackSegments,
} from './text-playback'

describe('text playback', () => {
  it('splits text into sentence ranges without including separator spaces', () => {
    const body = 'Minä olen opiskelija.  Oletko opettaja? Kyllä!'

    expect(getTextPlaybackSegments(body)).toEqual([
      { start: 0, end: 21, weight: 18 },
      { start: 23, end: 39, weight: 14 },
      { start: 40, end: 46, weight: 5 },
    ])
  })

  it('keeps the longer sentence active for a proportional part of audio', () => {
    const segments = getTextPlaybackSegments(
      'Lyhyt lause. Tämä toinen lause on huomattavasti pidempi.',
    )

    expect(getActiveTextPlaybackSegment(segments, 1, 10)).toBe(0)
    expect(getActiveTextPlaybackSegment(segments, 4, 10)).toBe(1)
    expect(getActiveTextPlaybackSegment(segments, 9.9, 10)).toBe(1)
  })

  it('does not select text without usable playback metadata', () => {
    const segments = getTextPlaybackSegments('Yksi lause.')

    expect(getActiveTextPlaybackSegment(segments, 0, 0)).toBeNull()
    expect(getActiveTextPlaybackSegment([], 0, 10)).toBeNull()
  })
})
