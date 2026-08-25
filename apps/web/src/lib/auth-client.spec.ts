import { afterEach, describe, expect, it, vi } from 'vitest'

import { requestPasswordReset } from './auth-client'

describe('password reset client', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns a retryable error when the network request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))

    await expect(requestPasswordReset('learner@example.test')).resolves.toEqual(
      {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Нет соединения с сервером. Проверьте интернет и повторите.',
        },
      },
    )
  })
})
