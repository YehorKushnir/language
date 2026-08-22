import { describe, expect, it } from 'vitest'

import { isReviewDue, type UserMemory } from './index.js'

const memory: UserMemory = {
  userId: 'user.local',
  itemId: 'grammar.fi.olla.negative',
  difficulty: 5,
  stability: 1,
  dueAt: new Date('2026-08-22T09:00:00.000Z'),
  lastReviewAt: null,
}

describe('isReviewDue', () => {
  it('returns true at the exact due time', () => {
    expect(isReviewDue(memory, new Date('2026-08-22T09:00:00.000Z'))).toBe(true)
  })

  it('returns false before the due time', () => {
    expect(isReviewDue(memory, new Date('2026-08-22T08:59:59.999Z'))).toBe(
      false,
    )
  })
})
