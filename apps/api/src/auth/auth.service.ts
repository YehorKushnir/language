import { prismaAdapter } from '@better-auth/prisma-adapter'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { betterAuth } from 'better-auth'

import { PrismaService } from '../database/prisma.service'

const DEVELOPMENT_AUTH_SECRET = 'development-only-change-me-32-characters'

@Injectable()
export class AuthService {
  readonly auth
  readonly basePath = '/api/v1/auth'

  constructor(
    @Inject(PrismaService) prisma: PrismaService,
    @Inject(ConfigService) config: ConfigService,
  ) {
    const configuredSecret = config.get<string>('BETTER_AUTH_SECRET')

    if (config.get('NODE_ENV') === 'production' && !configuredSecret) {
      throw new Error('BETTER_AUTH_SECRET is required in production')
    }

    this.auth = betterAuth({
      appName: 'Language Learning',
      basePath: this.basePath,
      baseURL: config.get<string>('BETTER_AUTH_URL', 'http://localhost:3000'),
      database: prismaAdapter(prisma, {
        provider: 'postgresql',
      }),
      emailAndPassword: {
        enabled: true,
      },
      secret: configuredSecret ?? DEVELOPMENT_AUTH_SECRET,
      trustedOrigins: [
        config.get<string>('WEB_ORIGIN', 'http://localhost:5173'),
      ],
    })
  }
}
