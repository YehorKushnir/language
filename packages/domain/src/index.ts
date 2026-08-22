export type ContentStatus =
  'draft' | 'generated' | 'verified' | 'curated' | 'blocked'

export type ExerciseItemRole = 'primary' | 'secondary' | 'context'

export interface UserMemory {
  userId: string
  itemId: string
  difficulty: number
  stability: number
  dueAt: Date
  lastReviewAt: Date | null
}

export function isReviewDue(memory: UserMemory, now: Date): boolean {
  return memory.dueAt.getTime() <= now.getTime()
}
