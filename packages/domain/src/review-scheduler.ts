export type ReviewEvidenceResult = 'SUCCESS' | 'FAILURE'

export interface ReviewMemorySnapshot {
  difficulty: number
  stability: number
  repetitions: number
  lapses: number
}

export interface ReviewSchedule extends ReviewMemorySnapshot {
  state: 'REVIEW' | 'RELEARNING'
  dueAt: Date
  lastReviewAt: Date
}

const MINUTE_MS = 60_000
const DAY_MS = 24 * 60 * MINUTE_MS

export function scheduleReview(
  memory: ReviewMemorySnapshot | null,
  result: ReviewEvidenceResult,
  reviewedAt: Date,
): ReviewSchedule {
  if (result === 'FAILURE') {
    const difficulty = clamp((memory?.difficulty ?? 5) + 0.5, 1, 10)
    const stability = clamp((memory?.stability ?? 0.5) * 0.5, 0.25, 365)

    return {
      difficulty: round(difficulty),
      stability: round(stability),
      state: 'RELEARNING',
      dueAt: new Date(reviewedAt.getTime() + 10 * MINUTE_MS),
      lastReviewAt: reviewedAt,
      repetitions: memory?.repetitions ?? 0,
      lapses: (memory?.lapses ?? 0) + 1,
    }
  }

  const difficulty = clamp((memory?.difficulty ?? 5) - 0.15, 1, 10)
  const stability = memory
    ? clamp(Math.max(1, memory.stability * 1.8), 0.25, 365)
    : 1

  return {
    difficulty: round(difficulty),
    stability: round(stability),
    state: 'REVIEW',
    dueAt: new Date(reviewedAt.getTime() + stability * DAY_MS),
    lastReviewAt: reviewedAt,
    repetitions: (memory?.repetitions ?? 0) + 1,
    lapses: memory?.lapses ?? 0,
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

function round(value: number): number {
  return Math.round(value * 1_000) / 1_000
}
