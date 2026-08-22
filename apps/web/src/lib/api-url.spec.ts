import { describe, expect, it } from 'vitest'

import { getApiUrl } from './api-url'

describe('getApiUrl', () => {
  it('uses the local API by default', () => {
    expect(getApiUrl(undefined)).toBe('http://localhost:3000/api/v1')
  })

  it('removes a trailing slash', () => {
    expect(getApiUrl('https://example.test/api/')).toBe(
      'https://example.test/api',
    )
  })
})
