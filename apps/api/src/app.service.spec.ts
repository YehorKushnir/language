import { describe, expect, it } from 'vitest'

import { AppService } from './app.service'

describe('AppService', () => {
  it('returns API information', () => {
    const service = new AppService()

    expect(service.getInfo()).toEqual({
      name: 'Language Learning API',
      version: '1',
    })
  })
})
