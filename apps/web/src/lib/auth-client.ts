import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  basePath: '/api/v1/auth',
})

interface PasswordResetResult {
  error?: {
    code?: string
    message?: string
  }
}

export async function requestPasswordReset(
  email: string,
): Promise<PasswordResetResult> {
  return postPasswordReset('/request-password-reset', {
    email,
    redirectTo: `${window.location.origin}/reset-password`,
  })
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<PasswordResetResult> {
  return postPasswordReset('/reset-password', { token, newPassword })
}

async function postPasswordReset(
  path: string,
  body: Record<string, string>,
): Promise<PasswordResetResult> {
  try {
    const response = await fetch(`/api/v1/auth${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = (await response.json().catch(() => ({}))) as {
      code?: string
      message?: string
    }

    if (!response.ok) {
      return {
        error: {
          code: data.code,
          message: data.message,
        },
      }
    }

    return {}
  } catch {
    return {
      error: {
        code: 'NETWORK_ERROR',
        message: 'Нет соединения с сервером. Проверьте интернет и повторите.',
      },
    }
  }
}
