import type { ExecutionContext } from '@nestjs/common'
import { UnauthorizedException } from '@nestjs/common'
import { describe, expect, it, vi } from 'vitest'

import type { AuthService } from '../auth/auth.service'
import { SessionIdentityGuard } from './session-identity.guard'

function createContext(request: { headers: Record<string, string> }) {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext
}

describe('SessionIdentityGuard', () => {
  it('uses the authenticated BetterAuth user id', async () => {
    const getSession = vi.fn().mockResolvedValue({
      session: { id: 'session.test' },
      user: { id: 'user.authenticated' },
    })
    const auth = {
      auth: { api: { getSession } },
    } as unknown as AuthService
    const request = { headers: { cookie: 'better-auth.session_token=test' } }
    const guard = new SessionIdentityGuard(auth)

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true)
    expect(request).toHaveProperty('currentUserId', 'user.authenticated')
  })

  it('rejects a request without a session', async () => {
    const auth = {
      auth: { api: { getSession: vi.fn().mockResolvedValue(null) } },
    } as unknown as AuthService
    const guard = new SessionIdentityGuard(auth)

    await expect(
      guard.canActivate(
        createContext({
          headers: { 'x-development-user-id': 'user.local' },
        }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })
})
