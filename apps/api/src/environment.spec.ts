import { describe, expect, it } from 'vitest'

import { validateEnvironment } from './environment'

const productionEnvironment = {
  NODE_ENV: 'production',
  API_PORT: '8080',
  DATABASE_URL: 'postgresql://language:secret@db:5432/language',
  WEB_ORIGIN: 'https://learn.example.com',
  BETTER_AUTH_URL: 'https://api.example.com',
  BETTER_AUTH_SECRET: 'a-unique-secret-with-more-than-32-characters',
}

describe('validateEnvironment', () => {
  it('normalizes the API port', () => {
    expect(validateEnvironment({ API_PORT: '4010' }).API_PORT).toBe(4010)
  })

  it('requires every production secret and URL', () => {
    expect(() =>
      validateEnvironment({
        ...productionEnvironment,
        BETTER_AUTH_SECRET: undefined,
      }),
    ).toThrow(/BETTER_AUTH_SECRET/u)
  })

  it('rejects insecure public URLs in production', () => {
    expect(() =>
      validateEnvironment({
        ...productionEnvironment,
        WEB_ORIGIN: 'http://learn.example.com',
      }),
    ).toThrow(/WEB_ORIGIN must use HTTPS/u)
  })

  it('accepts a complete production environment', () => {
    expect(validateEnvironment(productionEnvironment)).toMatchObject({
      API_PORT: 8080,
      WEB_ORIGIN: 'https://learn.example.com',
    })
  })
})
