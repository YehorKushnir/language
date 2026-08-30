import { describe, expect, it } from 'vitest'

import {
  getActiveTextPlaybackSegment,
  getTextPlaybackSegmentStartTime,
  getTextPlaybackSegments,
} from './text-playback'

describe('text playback', () => {
  it('splits text into sentence ranges without including separator spaces', () => {
    const body = 'Minä olen opiskelija.  Oletko opettaja? Kyllä!'

    expect(getTextPlaybackSegments(body)).toEqual([
      {
        start: 0,
        end: 21,
        weight: 18,
        audioStartMs: null,
        audioEndMs: null,
      },
      {
        start: 23,
        end: 39,
        weight: 14,
        audioStartMs: null,
        audioEndMs: null,
      },
      {
        start: 40,
        end: 46,
        weight: 5,
        audioStartMs: null,
        audioEndMs: null,
      },
    ])
  })

  it('uses exact audio timing to select the active sentence', () => {
    const body = 'Lyhyt lause. Tämä toinen lause on huomattavasti pidempi.'
    const ranges = getTextPlaybackSegments(body)
    const segments = getTextPlaybackSegments(
      body,
      ranges.map((range, index) => ({
        charStart: range.start,
        charEnd: range.end,
        audioStartMs: index === 0 ? 0 : 1750,
        audioEndMs: index === 0 ? 1750 : 10_000,
      })),
    )

    expect(getActiveTextPlaybackSegment(segments, 1)).toBe(0)
    expect(getActiveTextPlaybackSegment(segments, 1.75)).toBe(1)
    expect(getActiveTextPlaybackSegment(segments, 9.9)).toBe(1)
  })

  it('does not select text without usable playback metadata', () => {
    const segments = getTextPlaybackSegments('Yksi lause.')

    expect(getActiveTextPlaybackSegment(segments, 0)).toBeNull()
    expect(getActiveTextPlaybackSegment([], 0)).toBeNull()
    expect(getTextPlaybackSegmentStartTime(segments, 0)).toBeNull()
    expect(getActiveTextPlaybackSegment(segments, 0, 2.1)).toBe(0)
    expect(getTextPlaybackSegmentStartTime(segments, 0, 2.1)).toBe(0)
  })

  it('keeps sentence clicks working while the API has no exact timing', () => {
    const segments = getTextPlaybackSegments(
      'Ensimmäinen lause. Toinen lause on pidempi.',
    )
    const secondStart = getTextPlaybackSegmentStartTime(segments, 1, 10)

    expect(secondStart).not.toBeNull()
    expect(getActiveTextPlaybackSegment(segments, secondStart!, 10)).toBe(1)
  })

  it('returns the same boundary used to activate a selected sentence', () => {
    const body = 'Ensimmäinen lause. Toinen lause on pidempi. Kolmas lause.'
    const ranges = getTextPlaybackSegments(body)
    const audioBoundaries = [0, 3200, 7800, 11_000]
    const segments = getTextPlaybackSegments(
      body,
      ranges.map((range, index) => ({
        charStart: range.start,
        charEnd: range.end,
        audioStartMs: audioBoundaries[index]!,
        audioEndMs: audioBoundaries[index + 1]!,
      })),
    )
    const secondStart = getTextPlaybackSegmentStartTime(segments, 1)
    const thirdStart = getTextPlaybackSegmentStartTime(segments, 2)

    expect(getTextPlaybackSegmentStartTime(segments, 0)).toBe(0)
    expect(secondStart).toBe(3.2)
    expect(thirdStart).toBe(7.8)
    expect(getActiveTextPlaybackSegment(segments, secondStart!)).toBe(1)
    expect(getActiveTextPlaybackSegment(segments, thirdStart!)).toBe(2)
    expect(getTextPlaybackSegmentStartTime(segments, 3)).toBeNull()
  })
})
