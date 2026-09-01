import { describe, expect, it } from 'vitest'

import { buildPasswordResetEmail } from './password-reset-email'

describe('password reset email', () => {
  it('contains an accessible action, expiry, and plain-text fallback', () => {
    const message = buildPasswordResetEmail({
      name: 'Анна',
      resetUrl: 'https://learn.example.com/reset-password?token=test',
    })

    expect(message.subject).toContain('Morpho')
    expect(message.text).toContain('Здравствуйте, Анна!')
    expect(message.text).toContain('действует один час')
    expect(message.html).toContain('Задать новый пароль')
    expect(message.html).toContain(
      'https://learn.example.com/reset-password?token=test',
    )
  })

  it('escapes user-controlled values in HTML', () => {
    const message = buildPasswordResetEmail({
      name: '<script>alert(1)</script>',
      resetUrl: 'https://example.com/reset?next="bad"&token=1',
    })

    expect(message.html).not.toContain('<script>')
    expect(message.html).toContain('&lt;script&gt;')
    expect(message.html).toContain('&quot;bad&quot;&amp;token=1')
  })
})
