interface PasswordResetEmailInput {
  name?: string | null
  resetUrl: string
}

interface PasswordResetEmail {
  subject: string
  text: string
  html: string
}

export function buildPasswordResetEmail({
  name,
  resetUrl,
}: PasswordResetEmailInput): PasswordResetEmail {
  const greeting = name?.trim()
    ? `Здравствуйте, ${name.trim()}!`
    : 'Здравствуйте!'
  const safeGreeting = escapeHtml(greeting)
  const safeResetUrl = escapeHtml(resetUrl)

  return {
    subject: 'Сброс пароля в Morpho',
    text: [
      greeting,
      '',
      'Мы получили запрос на смену пароля вашего аккаунта Morpho.',
      'Чтобы задать новый пароль, откройте ссылку:',
      resetUrl,
      '',
      'Ссылка действует один час и может быть использована только один раз.',
      'Если вы не запрашивали смену пароля, ничего делать не нужно.',
    ].join('\n'),
    html: `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Сброс пароля в Morpho</title>
  </head>
  <body style="margin:0;background:#f5f5f0;color:#172018;font-family:Arial,sans-serif">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">Ссылка для создания нового пароля действует один час.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f0;padding:32px 16px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #dfe4dc;border-radius:16px;overflow:hidden">
            <tr>
              <td style="padding:28px 32px 12px;font:700 22px Georgia,serif;color:#173c2c">Morpho</td>
            </tr>
            <tr>
              <td style="padding:12px 32px 32px">
                <h1 style="margin:0 0 18px;font:700 28px Georgia,serif;line-height:1.25;color:#172018">Создайте новый пароль</h1>
                <p style="margin:0 0 12px;font-size:16px;line-height:1.6">${safeGreeting}</p>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#526056">Мы получили запрос на смену пароля вашего аккаунта. Нажмите кнопку ниже — ссылка действует один час.</p>
                <p style="margin:0 0 26px">
                  <a href="${safeResetUrl}" style="display:inline-block;border-radius:10px;background:#286446;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:13px 22px">Задать новый пароль</a>
                </p>
                <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#68736b">Если кнопка не открывается, скопируйте ссылку:</p>
                <p style="margin:0;word-break:break-all;font-size:13px;line-height:1.5;color:#286446">${safeResetUrl}</p>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #e7eae5;padding:20px 32px;font-size:13px;line-height:1.5;color:#68736b">Если вы не запрашивали смену пароля, просто проигнорируйте это письмо. Пароль останется прежним.</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
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
