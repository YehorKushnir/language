import { AttemptOutcome, EvidenceResult, MemoryState } from '@language/database'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AuthService } from '../auth/auth.service'
import { PrismaService } from '../database/prisma.service'
import { AccountService } from './account.service'

describe('AccountService', () => {
  const prisma = {
    account: { findMany: vi.fn() },
    user: { findUnique: vi.fn(), deleteMany: vi.fn() },
  }
  const auth = {
    googleEnabled: true,
    setPassword: vi.fn(),
  }
  const service = new AccountService(
    prisma as unknown as PrismaService,
    auth as unknown as AuthService,
  )

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reports linked Google and password authentication without secrets', async () => {
    prisma.account.findMany.mockResolvedValue([
      { providerId: 'credential' },
      { providerId: 'google' },
    ])

    await expect(service.getAuthMethods('user.1')).resolves.toEqual({
      passwordEnabled: true,
      googleLinked: true,
      googleAvailable: true,
    })
    expect(prisma.account.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user.1',
        OR: [
          { providerId: 'google' },
          { providerId: 'credential', password: { not: null } },
        ],
      },
      select: { providerId: true },
    })
  })

  it('sets the first password through the authenticated Better Auth session', async () => {
    const headers = { cookie: 'better-auth.session_token=test' }
    auth.setPassword.mockResolvedValue(undefined)

    await expect(service.setPassword(headers, 'new-password')).resolves.toBe(
      undefined,
    )
    expect(auth.setPassword).toHaveBeenCalledWith(headers, 'new-password')
  })

  it('asks for a fresh login when the session is too old to set a password', async () => {
    auth.setPassword.mockRejectedValue({
      body: { code: 'SESSION_NOT_FRESH' },
    })

    await expect(
      service.setPassword({}, 'new-password'),
    ).rejects.toBeInstanceOf(ForbiddenException)
  })

  it('exports learning data without authentication secrets', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user.1',
      name: 'Learner',
      email: 'learner@example.com',
      emailVerified: true,
      role: 'USER',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      courseProgress: [
        {
          routeVersionId: 'route.1',
          currentLessonId: 'lesson.1',
          startedAt: new Date('2026-01-02T00:00:00.000Z'),
          lastActivityAt: new Date('2026-01-03T00:00:00.000Z'),
          completedAt: null,
        },
      ],
      lessonProgress: [],
      vocabularyProgress: [
        {
          routeVersionId: 'route.1',
          lessonId: 'lesson.1',
          itemId: 'word.fi.test',
          correctAnswers: 2,
          attempts: 3,
          completedAt: null,
          lastAnsweredAt: new Date('2026-01-03T00:00:00.000Z'),
        },
      ],
      vocabularyAttempts: [
        {
          id: 'vocabulary-attempt.1',
          routeVersionId: 'route.1',
          lessonId: 'lesson.1',
          itemId: 'word.fi.test',
          answerText: 'testi',
          isCorrect: true,
          correctAnswersAfter: 2,
          answeredAt: new Date('2026-01-03T00:00:00.000Z'),
        },
      ],
      memories: [
        {
          itemId: 'word.fi.test',
          state: MemoryState.LEARNING,
          dueAt: new Date('2026-01-04T00:00:00.000Z'),
          lastReviewAt: null,
          repetitions: 1,
          lapses: 0,
        },
      ],
      attempts: [
        {
          id: 'attempt.1',
          exerciseId: 'exercise.1',
          routeVersionId: 'route.1',
          answerText: 'Minä olen.',
          outcome: AttemptOutcome.CORRECT,
          answeredAt: new Date('2026-01-03T00:00:00.000Z'),
          evidence: [
            {
              itemId: 'grammar.fi.olla',
              role: 'PRIMARY',
              result: EvidenceResult.SUCCESS,
            },
          ],
        },
      ],
      exerciseReports: [],
      accounts: [{ password: 'must never be returned' }],
      sessions: [{ token: 'must never be returned' }],
    })

    const result = await service.exportData('user.1')

    expect(result.user.email).toBe('learner@example.com')
    expect(result.memories[0]?.dueAt).toBe('2026-01-04T00:00:00.000Z')
    expect(result.vocabularyStudyProgress[0]?.correctAnswers).toBe(2)
    expect(result.vocabularyStudyAttempts[0]?.answerText).toBe('testi')
    expect(result.attempts[0]?.evidence[0]).toEqual({
      itemId: 'grammar.fi.olla',
      role: 'PRIMARY',
      result: EvidenceResult.SUCCESS,
    })
    expect(JSON.stringify(result)).not.toMatch(/password|token/u)
  })

  it('deletes the user and all cascading learning data', async () => {
    prisma.user.deleteMany.mockResolvedValue({ count: 1 })

    await expect(service.deleteAccount('user.1')).resolves.toBeUndefined()
    expect(prisma.user.deleteMany).toHaveBeenCalledWith({
      where: { id: 'user.1' },
    })
  })

  it('rejects deletion of an unknown user', async () => {
    prisma.user.deleteMany.mockResolvedValue({ count: 0 })

    await expect(service.deleteAccount('user.missing')).rejects.toBeInstanceOf(
      NotFoundException,
    )
  })
})
