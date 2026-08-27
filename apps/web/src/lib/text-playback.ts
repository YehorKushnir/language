export interface TextPlaybackSegment {
  start: number
  end: number
  weight: number
}

const SENTENCE_ENDINGS = new Set(['.', '!', '?'])
const CLOSING_PUNCTUATION = new Set(['"', "'", '»', '”', '’', ')', ']'])

export function getTextPlaybackSegments(body: string): TextPlaybackSegment[] {
  const segments: TextPlaybackSegment[] = []
  let start = skipWhitespace(body, 0)

  for (let index = start; index < body.length; index += 1) {
    if (!SENTENCE_ENDINGS.has(body[index] ?? '')) continue

    let end = index + 1
    while (end < body.length && CLOSING_PUNCTUATION.has(body[end] ?? '')) {
      end += 1
    }
    if (end < body.length && !isWhitespace(body[end] ?? '')) continue

    segments.push(createSegment(body, start, end))
    start = skipWhitespace(body, end)
    index = start - 1
  }

  if (start < body.length) {
    segments.push(createSegment(body, start, body.length))
  }

  return segments
}

export function getActiveTextPlaybackSegment(
  segments: TextPlaybackSegment[],
  currentTime: number,
  duration: number,
): number | null {
  if (
    segments.length === 0 ||
    !Number.isFinite(currentTime) ||
    !Number.isFinite(duration) ||
    currentTime < 0 ||
    duration <= 0
  ) {
    return null
  }

  const boundaries = getTextPlaybackSegmentBoundaries(segments, duration)
  const activeIndex = boundaries.findIndex((boundary) => currentTime < boundary)

  return activeIndex === -1 ? segments.length - 1 : activeIndex
}

export function getTextPlaybackSegmentStartTime(
  segments: TextPlaybackSegment[],
  segmentIndex: number,
  duration: number,
): number | null {
  if (
    segments.length === 0 ||
    !Number.isInteger(segmentIndex) ||
    segmentIndex < 0 ||
    segmentIndex >= segments.length ||
    !Number.isFinite(duration) ||
    duration <= 0
  ) {
    return null
  }

  if (segmentIndex === 0) return 0
  return getTextPlaybackSegmentBoundaries(segments, duration)[segmentIndex - 1]!
}

function getTextPlaybackSegmentBoundaries(
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

function createSegment(
  body: string,
  start: number,
  end: number,
): TextPlaybackSegment {
  const spokenCharacters = [...body.slice(start, end)].filter((character) =>
    /[\p{L}\p{N}]/u.test(character),
  ).length
  return { start, end, weight: Math.max(spokenCharacters, 1) }
}

function skipWhitespace(value: string, start: number): number {
  let index = start
  while (index < value.length && isWhitespace(value[index] ?? '')) index += 1
  return index
}

function isWhitespace(value: string): boolean {
  return /\s/u.test(value)
}
