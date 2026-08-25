import type { AccountDataExportResponse } from '@language/contracts'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '../database/prisma.service'

@Injectable()
export class AccountService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async exportData(userId: string): Promise<AccountDataExportResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        courseProgress: { orderBy: { startedAt: 'asc' } },
        lessonProgress: {
          orderBy: [{ routeVersionId: 'asc' }, { lessonId: 'asc' }],
        },
        vocabularyProgress: {
          orderBy: [
            { routeVersionId: 'asc' },
            { lessonId: 'asc' },
            { itemId: 'asc' },
          ],
        },
        vocabularyAttempts: { orderBy: { answeredAt: 'asc' } },
        memories: { orderBy: { itemId: 'asc' } },
        attempts: {
          orderBy: { answeredAt: 'asc' },
          include: { evidence: { orderBy: { itemId: 'asc' } } },
        },
        exerciseReports: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!user) throw new NotFoundException('User was not found')

    return {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
      },
      courseProgress: user.courseProgress.map((progress) => ({
        routeVersionId: progress.routeVersionId,
        currentLessonId: progress.currentLessonId,
        startedAt: progress.startedAt.toISOString(),
        lastActivityAt: progress.lastActivityAt.toISOString(),
        completedAt: progress.completedAt?.toISOString() ?? null,
      })),
      lessonProgress: user.lessonProgress.map((progress) => ({
        routeVersionId: progress.routeVersionId,
        lessonId: progress.lessonId,
        explanationCompletedAt:
          progress.explanationCompletedAt?.toISOString() ?? null,
        vocabularyCompletedAt:
          progress.vocabularyCompletedAt?.toISOString() ?? null,
        practiceCompletedAt:
          progress.practiceCompletedAt?.toISOString() ?? null,
        completedAt: progress.completedAt?.toISOString() ?? null,
      })),
      vocabularyStudyProgress: user.vocabularyProgress.map((progress) => ({
        routeVersionId: progress.routeVersionId,
        lessonId: progress.lessonId,
        itemId: progress.itemId,
        correctAnswers: progress.correctAnswers,
        attempts: progress.attempts,
        completedAt: progress.completedAt?.toISOString() ?? null,
        lastAnsweredAt: progress.lastAnsweredAt?.toISOString() ?? null,
      })),
      vocabularyStudyAttempts: user.vocabularyAttempts.map((attempt) => ({
        id: attempt.id,
        routeVersionId: attempt.routeVersionId,
        lessonId: attempt.lessonId,
        itemId: attempt.itemId,
        answerText: attempt.answerText,
        isCorrect: attempt.isCorrect,
        correctAnswersAfter: attempt.correctAnswersAfter,
        answeredAt: attempt.answeredAt.toISOString(),
      })),
      memories: user.memories.map((memory) => ({
        itemId: memory.itemId,
        state: memory.state,
        dueAt: memory.dueAt.toISOString(),
        lastReviewAt: memory.lastReviewAt?.toISOString() ?? null,
        repetitions: memory.repetitions,
        lapses: memory.lapses,
      })),
      attempts: user.attempts.map((attempt) => ({
        id: attempt.id,
        exerciseId: attempt.exerciseId,
        routeVersionId: attempt.routeVersionId,
        answerText: attempt.answerText,
        outcome: attempt.outcome,
        answeredAt: attempt.answeredAt.toISOString(),
        evidence: attempt.evidence.map((evidence) => ({
          itemId: evidence.itemId,
          role: evidence.role,
          result: evidence.result,
        })),
      })),
      exerciseReports: user.exerciseReports.map((report) => ({
        id: report.id,
        exerciseId: report.exerciseId,
        attemptId: report.attemptId,
        reason: report.reason,
        comment: report.comment,
        status: report.status,
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
      })),
    }
  }

  async deleteAccount(userId: string): Promise<void> {
    const result = await this.prisma.user.deleteMany({ where: { id: userId } })
    if (result.count === 0) throw new NotFoundException('User was not found')
  }
}
