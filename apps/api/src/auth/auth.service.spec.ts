import { ConfigService } from '@nestjs/config'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PrismaService } from '../database/prisma.service'
import { AuthService } from './auth.service'
import { PasswordResetMailer } from './password-reset-mailer.service'

const authMocks = vi.hoisted(() => ({
  betterAuth: vi.fn((options: unknown) => options),
  prismaAdapter: vi.fn(() => ({ id: 'prisma-adapter' })),
}))

vi.mock('better-auth', () => ({ betterAuth: authMocks.betterAuth }))
vi.mock('@better-auth/prisma-adapter', () => ({
  prismaAdapter: authMocks.prismaAdapter,
}))

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('configures Google OAuth and dispatches password reset email', async () => {
    const resetMailer = { send: vi.fn().mockResolvedValue(undefined) }
    new AuthService(
      {} as PrismaService,
      configService({
        GOOGLE_CLIENT_ID: 'google-client-id',
        GOOGLE_CLIENT_SECRET: 'google-client-secret',
      }),
      resetMailer as unknown as PasswordResetMailer,
    )

    const options = authMocks.betterAuth.mock.calls[0]?.[0] as {
      emailAndPassword: {
        sendResetPassword: (input: {
          user: { email: string; name: string }
          url: string
        }) => Promise<void>
      }
      socialProviders: Record<string, unknown>
    }
    expect(options.socialProviders).toEqual({
      google: {
        clientId: 'google-client-id',
        clientSecret: 'google-client-secret',
        prompt: 'select_account',
      },
    })

    await options.emailAndPassword.sendResetPassword({
      user: { email: 'anna@example.com', name: 'Анна' },
      url: 'https://example.com/reset?token=1',
    })
    expect(resetMailer.send).toHaveBeenCalledWith(
      { email: 'anna@example.com', name: 'Анна' },
      'https://example.com/reset?token=1',
    )
  })

  it('keeps local email authentication available without OAuth secrets', () => {
    new AuthService({} as PrismaService, configService({}), {
      send: vi.fn(),
    } as unknown as PasswordResetMailer)

    expect(authMocks.betterAuth.mock.calls[0]?.[0]).toMatchObject({
      socialProviders: {},
    })
  })
})

function configService(values: Record<string, string>): ConfigService {
  return {
    get: vi.fn((key: string, fallback?: string) => values[key] ?? fallback),
  } as unknown as ConfigService
}
