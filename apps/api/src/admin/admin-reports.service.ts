import type {
  AdminExerciseReportExportResponse,
  AdminExerciseReportListResponse,
  AdminExerciseReportResponse,
  ExerciseReportStatus as ReportStatus,
} from '@language/contracts'
import { Prisma } from '@language/database'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '../database/prisma.service'

const adminReportSelect = {
  id: true,
  exerciseId: true,
  attemptId: true,
  reason: true,
  comment: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: { id: true, name: true, email: true },
  },
  exercise: {
    select: {
      id: true,
      lessonId: true,
      targetText: true,
      prompts: {
        where: { sourceLanguage: 'ru' },
        take: 1,
        select: { text: true },
      },
    },
  },
  attempt: {
    select: {
      id: true,
      answerText: true,
      outcome: true,
      answeredAt: true,
    },
  },
} satisfies Prisma.ExerciseReportSelect

type AdminReportRecord = Prisma.ExerciseReportGetPayload<{
  select: typeof adminReportSelect
}>

@Injectable()
export class AdminReportsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listReports(
    status?: ReportStatus,
  ): Promise<AdminExerciseReportListResponse> {
    const [reports, groupedCounts] = await Promise.all([
      this.findReports(status),
      this.prisma.exerciseReport.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ])
    const counts = createEmptyCounts()
    for (const count of groupedCounts) {
      counts[count.status] = count._count._all
    }

    return {
      filter: status ?? 'ALL',
      totalCount: Object.values(counts).reduce(
        (total, count) => total + count,
        0,
      ),
      counts,
      items: reports.map(toAdminReport),
    }
  }

  async updateStatus(
    reportId: string,
    status: ReportStatus,
  ): Promise<AdminExerciseReportResponse> {
    const existing = await this.prisma.exerciseReport.findUnique({
      where: { id: reportId },
      select: { id: true },
    })
    if (!existing) {
      throw new NotFoundException(`Жалоба ${reportId} не найдена.`)
    }

    const report = await this.prisma.exerciseReport.update({
      where: { id: reportId },
      data: { status },
      select: adminReportSelect,
    })
    return toAdminReport(report)
  }

  async exportReports(
    status?: ReportStatus,
  ): Promise<AdminExerciseReportExportResponse> {
    const reports = await this.findReports(status)
    return {
      exportedAt: new Date().toISOString(),
      filter: status ?? 'ALL',
      totalCount: reports.length,
      items: reports.map(toAdminReport),
    }
  }

  private findReports(status?: ReportStatus): Promise<AdminReportRecord[]> {
    return this.prisma.exerciseReport.findMany({
      where: status ? { status } : undefined,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: adminReportSelect,
    })
  }
}

function createEmptyCounts(): Record<ReportStatus, number> {
  return {
    NEW: 0,
    IN_PROGRESS: 0,
    FIXED: 0,
    DISMISSED: 0,
  }
}

function toAdminReport(report: AdminReportRecord): AdminExerciseReportResponse {
  return {
    id: report.id,
    exerciseId: report.exerciseId,
    attemptId: report.attemptId,
    reason: report.reason,
    comment: report.comment,
    status: report.status,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
    reporter: report.user,
    exercise: {
      id: report.exercise.id,
      lessonId: report.exercise.lessonId,
      prompt: report.exercise.prompts[0]?.text ?? report.exercise.targetText,
      expectedAnswer: report.exercise.targetText,
    },
    attempt: {
      id: report.attempt.id,
      answerText: report.attempt.answerText,
      outcome: report.attempt.outcome,
      answeredAt: report.attempt.answeredAt.toISOString(),
    },
  }
}
