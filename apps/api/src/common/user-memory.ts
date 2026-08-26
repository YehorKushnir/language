import { MemoryState } from '@language/database'
import {
  createInitialMemory,
  type ReviewMemorySnapshot,
} from '@language/domain'

export interface StoredUserMemory {
  difficulty: number
  stability: number
  state: MemoryState
  dueAt: Date
  lastReviewAt: Date | null
  elapsedDays: number
  scheduledDays: number
  learningSteps: number
  repetitions: number
  lapses: number
}

export function toReviewMemorySnapshot(
  memory: StoredUserMemory,
): ReviewMemorySnapshot {
  return {
    difficulty: memory.difficulty,
    stability: memory.stability,
    state: memory.state,
    dueAt: memory.dueAt,
    lastReviewAt: memory.lastReviewAt,
    elapsedDays: memory.elapsedDays,
    scheduledDays: memory.scheduledDays,
    learningSteps: memory.learningSteps,
    repetitions: memory.repetitions,
    lapses: memory.lapses,
  }
}

export function toUserMemoryData(memory: ReviewMemorySnapshot) {
  return {
    difficulty: memory.difficulty,
    stability: memory.stability,
    state: MemoryState[memory.state],
    dueAt: memory.dueAt,
    lastReviewAt: memory.lastReviewAt,
    elapsedDays: memory.elapsedDays,
    scheduledDays: memory.scheduledDays,
    learningSteps: memory.learningSteps,
    repetitions: memory.repetitions,
    lapses: memory.lapses,
  }
}

export function initialUserMemoryData(encounteredAt: Date) {
  return toUserMemoryData(createInitialMemory(encounteredAt))
}
