import type { ExerciseReportStatus } from '@language/contracts'
import { NotFoundException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PrismaService } from '../database/prisma.service'
import { AdminReportsService } from './admin-reports.service'

describe('AdminReportsService', () => {
  const prisma = {
    exerciseReport: {
      findMany: vi.fn(),
      groupBy: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  }
  const service = new AdminReportsService(prisma as unknown as PrismaService)

  beforeEach(() => {
    vi.clearAllMocks()
    prisma.exerciseReport.findMany.mockResolvedValue([reportRecord()])
    prisma.exerciseReport.groupBy.mockResolvedValue([
      { status: 'NEW', _count: { _all: 1 } },
      { status: 'FIXED', _count: { _all: 2 } },
    ])
  })

  it('lists only the selected status and returns counts for every tab', async () => {
    const result = await service.listReports('NEW')

    expect(prisma.exerciseReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'NEW' } }),
    )
    expect(result).toMatchObject({
      filter: 'NEW',
      totalCount: 3,
      counts: { NEW: 1, IN_PROGRESS: 0, FIXED: 2, DISMISSED: 0 },
      items: [
        {
          id: 'report.1',
          reporter: { email: 'learner@example.com' },
          exercise: {
            prompt: 'Я студент.',
            expectedAnswer: 'Minä olen opiskelija.',
          },
          attempt: { answerText: 'Minä olet opiskelija.' },
        },
      ],
    })
  })

  it('applies the same status filter to JSON export', async () => {
    const result = await service.exportReports('FIXED')

    expect(prisma.exerciseReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'FIXED' } }),
    )
    expect(result.filter).toBe('FIXED')
    expect(result.totalCount).toBe(1)
  })

  it('updates a report status', async () => {
    prisma.exerciseReport.findUnique.mockResolvedValue({ id: 'report.1' })
    prisma.exerciseReport.update.mockResolvedValue(reportRecord('FIXED'))

    await expect(
      service.updateStatus('report.1', 'FIXED'),
    ).resolves.toMatchObject({ id: 'report.1', status: 'FIXED' })
    expect(prisma.exerciseReport.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'report.1' },
        data: { status: 'FIXED' },
      }),
    )
  })

  it('rejects an unknown report', async () => {
    prisma.exerciseReport.findUnique.mockResolvedValue(null)

    await expect(
      service.updateStatus('report.missing', 'DISMISSED'),
    ).rejects.toBeInstanceOf(NotFoundException)
  })
})

function reportRecord(status: ExerciseReportStatus = 'NEW') {
  return {
    id: 'report.1',
    exerciseId: 'exercise.1',
    attemptId: 'attempt.1',
    reason: 'WRONG_ANSWER' as const,
    comment: 'Этот вариант тоже подходит.',
    status,
    createdAt: new Date('2026-08-26T09:00:00.000Z'),
    updatedAt: new Date('2026-08-26T09:00:00.000Z'),
    user: {
      id: 'user.1',
      name: 'Learner',
      email: 'learner@example.com',
    },
    exercise: {
      id: 'exercise.1',
      lessonId: 'lesson.1',
      targetText: 'Minä olen opiskelija.',
      prompts: [{ text: 'Я студент.' }],
    },
    attempt: {
      id: 'attempt.1',
      answerText: 'Minä olet opiskelija.',
      outcome: 'INCORRECT' as const,
      answeredAt: new Date('2026-08-26T08:59:00.000Z'),
    },
  }
}
