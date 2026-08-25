import { afterEach, describe, expect, it, vi } from 'vitest'

import { installClientErrorReporting } from './client-telemetry'

describe('client error reporting', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('swallows failures from the fallback telemetry request', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('offline'))
    vi.stubGlobal('fetch', fetchMock)
    Object.defineProperty(navigator, 'sendBeacon', {
      configurable: true,
      value: undefined,
    })
    installClientErrorReporting()

    window.dispatchEvent(new ErrorEvent('error', { message: 'Render failed' }))
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(fetchMock).toHaveBeenCalledOnce()
  })
})
