import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import nodemailer, { type Transporter } from 'nodemailer'

@Injectable()
export class PasswordResetMailer {
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
    })
  }

  async send(email: string, resetUrl: string): Promise<void> {
    if (!this.transport) {
      this.logger.warn(
        JSON.stringify({
          event: 'password_reset_development_link',
          email,
          resetUrl,
        }),
      )
      return
    }

    await this.transport.sendMail({
      from: this.from,
      to: email,
      subject: 'Восстановление пароля',
      text: [
        'Вы запросили восстановление пароля.',
        '',
        `Откройте ссылку в течение часа: ${resetUrl}`,
        '',
        'Если это были не вы, просто проигнорируйте письмо.',
      ].join('\n'),
      html: `<p>Вы запросили восстановление пароля.</p><p><a href="${escapeHtml(resetUrl)}">Задать новый пароль</a></p><p>Ссылка действует один час. Если это были не вы, просто проигнорируйте письмо.</p>`,
    })
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}
