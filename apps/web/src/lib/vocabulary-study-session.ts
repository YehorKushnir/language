import type {
  LessonVocabularyStudyProgressResponse,
  LessonVocabularyStudySessionResponse,
} from '@language/contracts'

export function appendVocabularyAnswer(
  session: LessonVocabularyStudySessionResponse,
  itemId: string,
  isCorrect: boolean,
  answeredAt: string,
): {
  itemProgress: LessonVocabularyStudyProgressResponse
  session: LessonVocabularyStudySessionResponse
} {
  const previous = session.items.find((item) => item.itemId === itemId) ?? {
    itemId,
    correctAnswers: 0,
    attempts: 0,
    completedAt: null,
  }
  const correctAnswers = Math.min(
    session.requiredCorrectAnswers,
    previous.correctAnswers + (isCorrect ? 1 : 0),
  )
  const itemProgress = {
    ...previous,
    correctAnswers,
    attempts: previous.attempts + 1,
    completedAt:
      previous.completedAt ??
      (correctAnswers >= session.requiredCorrectAnswers ? answeredAt : null),
  }
  const items = session.items.map((item) =>
    item.itemId === itemId ? itemProgress : item,
  )

  return {
    itemProgress,
    session: {
      ...session,
      completedItems: items.filter(
        (item) => item.correctAnswers >= session.requiredCorrectAnswers,
      ).length,
      totalCorrectAnswers: items.reduce(
        (total, item) => total + item.correctAnswers,
        0,
      ),
      items,
    },
  }
}

export function getNextVocabularyItemId(
  itemIds: string[],
  session: LessonVocabularyStudySessionResponse,
  currentItemId?: string | null,
): string | null {
  const progressByItem = new Map(
    session.items.map((item) => [item.itemId, item.correctAnswers]),
  )
  const incomplete = itemIds.filter(
    (itemId) =>
      (progressByItem.get(itemId) ?? 0) < session.requiredCorrectAnswers,
  )
  if (incomplete.length === 0) return null

  const minimumCorrect = Math.min(
    ...incomplete.map((itemId) => progressByItem.get(itemId) ?? 0),
  )
  const candidates = new Set(
    incomplete.filter(
      (itemId) => (progressByItem.get(itemId) ?? 0) === minimumCorrect,
    ),
  )
  if (!currentItemId) {
    return itemIds.find((itemId) => candidates.has(itemId)) ?? null
  }

  const currentIndex = Math.max(0, itemIds.indexOf(currentItemId))
  for (let offset = 1; offset <= itemIds.length; offset += 1) {
    const itemId = itemIds[(currentIndex + offset) % itemIds.length]
    if (itemId && candidates.has(itemId)) return itemId
  }
  return null
}
