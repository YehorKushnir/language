import { createEmptyCard, fsrs, Rating, State, type Card } from 'ts-fsrs'

export type ReviewEvidenceResult = 'SUCCESS' | 'FAILURE'
export type ReviewMemoryState = 'NEW' | 'LEARNING' | 'REVIEW' | 'RELEARNING'

export interface ReviewMemorySnapshot {
  difficulty: number
  stability: number
  state: ReviewMemoryState
  dueAt: Date
  lastReviewAt: Date | null
  elapsedDays: number
  scheduledDays: number
  learningSteps: number
  repetitions: number
  lapses: number
}

export interface ReviewSchedule extends ReviewMemorySnapshot {
  lastReviewAt: Date
}

export type WordMemoryStatus = 'NEW' | 'LEARNING' | 'KNOWN'

export interface RecordedReview {
  memory: ReviewMemorySnapshot
  wasScheduledReview: boolean
}

const MINUTE_MS = 60_000
const DAY_MS = 24 * 60 * MINUTE_MS

export const INITIAL_REVIEW_DELAY_MINUTES = 20
export const KNOWN_REVIEW_INTERVAL_DAYS = 60

const scheduler = fsrs({
  request_retention: 0.9,
  maximum_interval: 3_650,
  enable_fuzz: false,
  enable_short_term: true,
  learning_steps: ['10m'],
  relearning_steps: ['10m'],
})

export function scheduleReview(
  memory: ReviewMemorySnapshot | null,
  result: ReviewEvidenceResult,
  reviewedAt: Date,
): ReviewSchedule {
  const card = memory ? toFsrsCard(memory) : createEmptyCard(reviewedAt)
  const rating = result === 'SUCCESS' ? Rating.Good : Rating.Again
  const nextCard = scheduler.next(card, reviewedAt, rating).card

  return {
    difficulty: nextCard.difficulty,
    stability: nextCard.stability,
    state: fromFsrsState(nextCard.state),
    dueAt: nextCard.due,
    lastReviewAt: nextCard.last_review ?? reviewedAt,
    elapsedDays: nextCard.elapsed_days,
    scheduledDays: nextCard.scheduled_days,
    learningSteps: nextCard.learning_steps,
    repetitions: nextCard.reps,
    lapses: nextCard.lapses,
  }
}

export function createInitialMemory(encounteredAt: Date): ReviewMemorySnapshot {
  return {
    difficulty: 0,
    stability: 0,
    state: 'NEW',
    dueAt: new Date(
      encounteredAt.getTime() + INITIAL_REVIEW_DELAY_MINUTES * MINUTE_MS,
    ),
    lastReviewAt: null,
    elapsedDays: 0,
    scheduledDays: 0,
    learningSteps: 0,
    repetitions: 0,
    lapses: 0,
  }
}

/**
 * Records only reviews that were already due when the evidence was produced.
 * Exercise answers before dueAt remain useful incidental exposure, but cannot
 * advance or reset the spaced-repetition card.
 */
export function recordReview(
  memory: ReviewMemorySnapshot,
  result: ReviewEvidenceResult,
  reviewedAt: Date,
): RecordedReview {
  if (reviewedAt.getTime() < memory.dueAt.getTime()) {
    return { memory, wasScheduledReview: false }
  }

  return {
    memory: scheduleReview(memory, result, reviewedAt),
    wasScheduledReview: true,
  }
}

export function changeWordMemoryStatus(
  memory: ReviewMemorySnapshot,
  status: WordMemoryStatus,
  changedAt: Date,
): ReviewMemorySnapshot {
  if (status === 'NEW') {
    return {
      ...createInitialMemory(changedAt),
      // An explicit "don't know" choice should return the word to the front
      // of practice immediately, unlike a first passive encounter.
      dueAt: changedAt,
    }
  }

  if (status === 'LEARNING') {
    return scheduleReview(null, 'FAILURE', changedAt)
  }

  return {
    difficulty: memory.difficulty > 0 ? memory.difficulty : 5,
    stability: Math.max(memory.stability, KNOWN_REVIEW_INTERVAL_DAYS),
    state: 'REVIEW',
    dueAt: new Date(changedAt.getTime() + KNOWN_REVIEW_INTERVAL_DAYS * DAY_MS),
    lastReviewAt: changedAt,
    elapsedDays: 0,
    scheduledDays: KNOWN_REVIEW_INTERVAL_DAYS,
    learningSteps: 0,
    repetitions: Math.max(memory.repetitions, 1),
    lapses: memory.lapses,
  }
}

function toFsrsCard(memory: ReviewMemorySnapshot): Card {
  return {
    due: memory.dueAt,
    stability: memory.stability,
    difficulty: memory.difficulty,
    elapsed_days: memory.elapsedDays,
    scheduled_days: memory.scheduledDays,
    learning_steps: memory.learningSteps,
    reps: memory.repetitions,
    lapses: memory.lapses,
    state: toFsrsState(memory.state),
    ...(memory.lastReviewAt ? { last_review: memory.lastReviewAt } : {}),
  }
}

function toFsrsState(state: ReviewMemoryState): State {
  if (state === 'LEARNING') return State.Learning
  if (state === 'REVIEW') return State.Review
  if (state === 'RELEARNING') return State.Relearning
  return State.New
}

function fromFsrsState(state: State): ReviewMemoryState {
  if (state === State.Learning) return 'LEARNING'
  if (state === State.Review) return 'REVIEW'
  if (state === State.Relearning) return 'RELEARNING'
  return 'NEW'
}
