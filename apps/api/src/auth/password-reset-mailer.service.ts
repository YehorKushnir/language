import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import nodemailer, { type Transporter } from 'nodemailer'

import { buildPasswordResetEmail } from './password-reset-email'

interface PasswordResetRecipient {
  email: string
  name?: string | null
}

@Injectable()
export class PasswordResetMailer implements OnModuleDestroy {
  private readonly logger = new Logger(PasswordResetMailer.name)
  private readonly from: string
  private readonly transport: Transporter | null

  constructor(@Inject(ConfigService) config: ConfigService) {
    this.from = config.get<string>(
      'MAIL_FROM',
      'Language Learning <no-reply@localhost>',
    )
    const host = config.get<string>('SMTP_HOST')

    if (!host) {
      this.transport = null
      return
    }

    const user = config.get<string>('SMTP_USER')
    const password = config.get<string>('SMTP_PASSWORD')
    this.transport = nodemailer.createTransport({
      host,
      port: config.get<number>('SMTP_PORT', 587),
      secure: config.get<boolean>('SMTP_SECURE', false),
      auth: user && password ? { user, pass: password } : undefined,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 30_000,
    })
  }

  onModuleDestroy(): void {
    this.transport?.close()
  }

  async send(
    recipient: PasswordResetRecipient,
    resetUrl: string,
  ): Promise<void> {
    if (!this.transport) {
      this.logger.warn(
        JSON.stringify({
          event: 'password_reset_development_link',
          email: recipient.email,
          resetUrl,
        }),
      )
      return
    }

    const message = buildPasswordResetEmail({
      name: recipient.name,
      resetUrl,
    })

    try {
      await this.transport.sendMail({
        from: this.from,
        to: recipient.email,
        ...message,
        headers: { 'X-Auto-Response-Suppress': 'All' },
      })
    } catch (error) {
      this.logger.error(
        JSON.stringify({ event: 'password_reset_delivery_failed' }),
        error instanceof Error ? error.stack : undefined,
      )
      throw error
    }
  }
}
