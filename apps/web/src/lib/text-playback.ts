import type { PreparedTextAudioSegmentResponse } from '@language/contracts'

export interface TextPlaybackSegment {
  start: number
  end: number
  weight: number
  audioStartMs: number | null
  audioEndMs: number | null
}

const SENTENCE_ENDINGS = new Set(['.', '!', '?'])
const CLOSING_PUNCTUATION = new Set(['"', "'", '»', '”', '’', ')', ']'])

export function getTextPlaybackSegments(
  body: string,
  audioSegments: PreparedTextAudioSegmentResponse[] = [],
): TextPlaybackSegment[] {
  const ranges = getSentenceRanges(body)
  const hasValidAudioSegments =
    ranges.length === audioSegments.length &&
    ranges.every((range, index) => {
      const audioSegment = audioSegments[index]
      const previous = audioSegments[index - 1]
      return (
        audioSegment !== undefined &&
        audioSegment.charStart === range.start &&
        audioSegment.charEnd === range.end &&
        Number.isInteger(audioSegment.audioStartMs) &&
        Number.isInteger(audioSegment.audioEndMs) &&
        audioSegment.audioStartMs >= 0 &&
        audioSegment.audioEndMs > audioSegment.audioStartMs &&
        (previous === undefined ||
          previous.audioEndMs === audioSegment.audioStartMs)
      )
    })

  return ranges.map((range, index) => ({
    ...range,
    weight: getSpokenCharacterCount(body.slice(range.start, range.end)),
    audioStartMs: hasValidAudioSegments
      ? (audioSegments[index]?.audioStartMs ?? null)
      : null,
    audioEndMs: hasValidAudioSegments
      ? (audioSegments[index]?.audioEndMs ?? null)
      : null,
  }))
}

export function getActiveTextPlaybackSegment(
  segments: TextPlaybackSegment[],
  currentTime: number,
  duration?: number,
): number | null {
  if (
    segments.length === 0 ||
    !Number.isFinite(currentTime) ||
    currentTime < 0
  ) {
    return null
  }

  if (segments[0]?.audioStartMs !== null) {
    const currentTimeMs = currentTime * 1000
    const activeIndex = segments.findIndex(
      (segment) =>
        segment.audioStartMs !== null &&
        segment.audioEndMs !== null &&
        currentTimeMs >= segment.audioStartMs &&
        currentTimeMs < segment.audioEndMs,
    )
    return activeIndex === -1 ? null : activeIndex
  }

  if (duration === undefined || !Number.isFinite(duration) || duration <= 0) {
    return null
  }
  const boundaries = getEstimatedSegmentBoundaries(segments, duration)
  const activeIndex = boundaries.findIndex((boundary) => currentTime < boundary)
  return activeIndex === -1 ? segments.length - 1 : activeIndex
}

export function getTextPlaybackSegmentStartTime(
  segments: TextPlaybackSegment[],
  segmentIndex: number,
  duration?: number,
): number | null {
  if (
    !Number.isInteger(segmentIndex) ||
    segmentIndex < 0 ||
    segmentIndex >= segments.length
  ) {
    return null
  }

  const audioStartMs = segments[segmentIndex]?.audioStartMs
  if (audioStartMs !== null && audioStartMs !== undefined) {
    return audioStartMs / 1000
  }
  if (duration === undefined || !Number.isFinite(duration) || duration <= 0) {
    return null
  }
  if (segmentIndex === 0) return 0
  return getEstimatedSegmentBoundaries(segments, duration)[segmentIndex - 1]!
}

function getEstimatedSegmentBoundaries(
  segments: TextPlaybackSegment[],
  duration: number,
): number[] {
  const leadIn = Math.min(0.35, duration * 0.03)
  const tail = Math.min(0.2, duration * 0.02)
  const pause = Math.min(0.38, duration * 0.025)
  const pauseBudget = pause * Math.max(segments.length - 1, 0)
  const speechBudget = Math.max(duration - leadIn - tail - pauseBudget, 0)
  const totalWeight = segments.reduce(
    (total, segment) => total + segment.weight,
    0,
  )
  let boundary = leadIn

  return segments.map((segment, index) => {
    const speechDuration = totalWeight
      ? (speechBudget * segment.weight) / totalWeight
      : speechBudget / segments.length
    boundary += speechDuration
    if (index < segments.length - 1) boundary += pause
    return boundary
  })
}

function getSpokenCharacterCount(value: string): number {
  const spokenCharacters = [...value].filter((character) =>
    /[\p{L}\p{N}]/u.test(character),
  ).length
  return Math.max(spokenCharacters, 1)
}

function getSentenceRanges(
  body: string,
): Array<{ start: number; end: number }> {
  const segments: Array<{ start: number; end: number }> = []
  let start = skipWhitespace(body, 0)

  for (let index = start; index < body.length; index += 1) {
    if (!SENTENCE_ENDINGS.has(body[index] ?? '')) continue

    let end = index + 1
    while (end < body.length && CLOSING_PUNCTUATION.has(body[end] ?? '')) {
      end += 1
    }
    if (end < body.length && !isWhitespace(body[end] ?? '')) continue

    segments.push({ start, end })
    start = skipWhitespace(body, end)
    index = start - 1
  }

  if (start < body.length) {
    segments.push({ start, end: body.length })
  }

  return segments
}

function skipWhitespace(value: string, start: number): number {
  let index = start
  while (index < value.length && isWhitespace(value[index] ?? '')) index += 1
  return index
}

function isWhitespace(value: string): boolean {
  return /\s/u.test(value)
}
