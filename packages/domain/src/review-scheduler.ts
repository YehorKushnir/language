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
