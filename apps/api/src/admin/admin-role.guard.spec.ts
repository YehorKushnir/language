import type { ExecutionContext } from '@nestjs/common'
import { ForbiddenException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PrismaService } from '../database/prisma.service'
import { AdminRoleGuard } from './admin-role.guard'

function createContext(request: { currentUserId?: string }) {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as ExecutionContext
}

describe('AdminRoleGuard', () => {
  const prisma = { user: { findUnique: vi.fn() } }
  const guard = new AdminRoleGuard(prisma as unknown as PrismaService)

  beforeEach(() => vi.clearAllMocks())

  it('allows an authenticated administrator', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'ADMIN' })

    await expect(
      guard.canActivate(createContext({ currentUserId: 'user.admin' })),
    ).resolves.toBe(true)
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user.admin' },
      select: { role: true },
    })
  })

  it('rejects a regular user', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'USER' })

    await expect(
      guard.canActivate(createContext({ currentUserId: 'user.learner' })),
    ).rejects.toBeInstanceOf(ForbiddenException)
  })
})
