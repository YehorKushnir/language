import type {
  UserVocabularyResponse,
  WordMemoryStatus,
} from '@language/contracts'

const MINUTE_MS = 60_000
const DAY_MS = 24 * 60 * MINUTE_MS

export function applyOptimisticWordMemoryStatus(
  vocabulary: UserVocabularyResponse,
  itemId: string,
  status: WordMemoryStatus,
  changedAt = new Date(),
): UserVocabularyResponse {
  const item = vocabulary.items.find((candidate) => candidate.itemId === itemId)
  if (!item) return vocabulary

  const nextStatus = status === 'KNOWN' ? 'LEARNED' : 'LEARNING'
  const wasDue = item.memory.isDue
  const statusChanged = item.memory.status !== nextStatus
  const dueAt = new Date(
    changedAt.getTime() + (status === 'KNOWN' ? 60 * DAY_MS : 10 * MINUTE_MS),
  ).toISOString()

  return {
    ...vocabulary,
    dueCount: Math.max(0, vocabulary.dueCount - (wasDue ? 1 : 0)),
    counts: {
      ...vocabulary.counts,
      due: Math.max(0, vocabulary.counts.due - (wasDue ? 1 : 0)),
      learning:
        vocabulary.counts.learning +
        (statusChanged ? (nextStatus === 'LEARNING' ? 1 : -1) : 0),
      learned:
        vocabulary.counts.learned +
        (statusChanged ? (nextStatus === 'LEARNED' ? 1 : -1) : 0),
    },
    items: vocabulary.items.map((candidate) =>
      candidate.itemId === itemId
        ? {
            ...candidate,
            memory: {
              ...candidate.memory,
              state: status === 'KNOWN' ? 'REVIEW' : 'LEARNING',
              status: nextStatus,
              progressPercent: status === 'KNOWN' ? 100 : 0,
              dueAt,
              isDue: false,
              repetitions:
                status === 'KNOWN'
                  ? Math.max(candidate.memory.repetitions, 1)
                  : 1,
              lapses: status === 'KNOWN' ? candidate.memory.lapses : 0,
            },
          }
        : candidate,
    ),
  }
}
