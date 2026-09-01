import { prismaAdapter } from '@better-auth/prisma-adapter'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { betterAuth } from 'better-auth'

import { PrismaService } from '../database/prisma.service'
import { PasswordResetMailer } from './password-reset-mailer.service'

const DEVELOPMENT_AUTH_SECRET = 'development-only-change-me-32-characters'

@Injectable()
export class AuthService {
  readonly auth
  readonly basePath = '/api/v1/auth'

  constructor(
    @Inject(PrismaService) prisma: PrismaService,
    @Inject(ConfigService) config: ConfigService,
    @Inject(PasswordResetMailer) resetMailer: PasswordResetMailer,
  ) {
    const configuredSecret = config.get<string>('BETTER_AUTH_SECRET')
    const googleClientId = config.get<string>('GOOGLE_CLIENT_ID')
    const googleClientSecret = config.get<string>('GOOGLE_CLIENT_SECRET')

    if (config.get('NODE_ENV') === 'production' && !configuredSecret) {
      throw new Error('BETTER_AUTH_SECRET is required in production')
    }

    this.auth = betterAuth({
      appName: 'Morpho',
      basePath: this.basePath,
      baseURL: config.get<string>('BETTER_AUTH_URL', 'http://localhost:3000'),
      database: prismaAdapter(prisma, {
        provider: 'postgresql',
      }),
      user: {
        additionalFields: {
          role: {
            type: 'string',
            defaultValue: 'USER',
            input: false,
          },
        },
      },
      emailAndPassword: {
        enabled: true,
        resetPasswordTokenExpiresIn: 60 * 60,
        revokeSessionsOnPasswordReset: true,
        sendResetPassword: ({ user, url }) => {
          // Keep the public response timing independent from the SMTP relay.
          // The mailer logs delivery failures without exposing the reset link.
          void resetMailer
            .send({ email: user.email, name: user.name }, url)
            .catch(() => undefined)
          return Promise.resolve()
        },
      },
      socialProviders:
        googleClientId && googleClientSecret
          ? {
              google: {
                clientId: googleClientId,
                clientSecret: googleClientSecret,
                prompt: 'select_account',
              },
            }
          : {},
      rateLimit: {
        enabled: config.get('NODE_ENV') === 'production',
        window: 60,
        max: 100,
      },
      secret: configuredSecret ?? DEVELOPMENT_AUTH_SECRET,
      trustedOrigins: [
        config.get<string>('WEB_ORIGIN', 'http://localhost:5173'),
      ],
    })
  }
}
