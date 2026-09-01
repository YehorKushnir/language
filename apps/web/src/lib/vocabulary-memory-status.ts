import type {
  UserVocabularyResponse,
  WordMemoryStatus,
} from '@language/contracts'

const DAY_MS = 24 * 60 * 60_000

export function applyOptimisticWordMemoryStatus(
  vocabulary: UserVocabularyResponse,
  itemId: string,
  status: WordMemoryStatus,
  changedAt = new Date(),
  restoredMemory?: UserVocabularyResponse['items'][number]['memory'],
): UserVocabularyResponse {
  const item = vocabulary.items.find((candidate) => candidate.itemId === itemId)
  if (!item) return vocabulary

  let nextMemory: UserVocabularyResponse['items'][number]['memory']
  if (status === 'KNOWN') {
    nextMemory = {
      ...item.memory,
      state: 'REVIEW',
      status: 'LEARNED',
      progressPercent: 100,
      dueAt: new Date(changedAt.getTime() + 60 * DAY_MS).toISOString(),
      isDue: false,
      repetitions: Math.max(item.memory.repetitions, 1),
    }
  } else {
    if (!restoredMemory) return vocabulary
    nextMemory = restoredMemory
  }
  const nextStatus = nextMemory.status
  const wasDue = item.memory.isDue
  const isDue = nextMemory.isDue
  const statusChanged = item.memory.status !== nextStatus
  const dueDelta = Number(isDue) - Number(wasDue)

  return {
    ...vocabulary,
    dueCount: Math.max(0, vocabulary.dueCount + dueDelta),
    counts: {
      ...vocabulary.counts,
      due: Math.max(0, vocabulary.counts.due + dueDelta),
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
            memory: nextMemory,
          }
        : candidate,
    ),
  }
}
