import { describe, expect, it } from 'vitest'

import { validateEnvironment } from './environment'

const productionEnvironment = {
  NODE_ENV: 'production',
  API_PORT: '8080',
  DATABASE_URL: 'postgresql://language:secret@db:5432/language',
  WEB_ORIGIN: 'https://learn.example.com',
  BETTER_AUTH_URL: 'https://api.example.com',
  BETTER_AUTH_SECRET: 'a-unique-secret-with-more-than-32-characters',
  GOOGLE_CLIENT_ID: 'google-client-id.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: 'google-client-secret',
  SMTP_HOST: 'smtp.example.com',
  SMTP_PORT: '587',
  MAIL_FROM: 'Language Learning <hello@example.com>',
  TTS_PROVIDER: 'google',
  GOOGLE_TTS_PROJECT_ID: 'language-test',
  GOOGLE_TTS_VOICE: 'fi-FI-test-voice',
  AUDIO_STORAGE_PROVIDER: 'r2',
  AUDIO_STORAGE_BUCKET: 'audio',
  AUDIO_STORAGE_ENDPOINT: 'https://account.r2.cloudflarestorage.com',
  AUDIO_STORAGE_ACCESS_KEY: 'access',
  AUDIO_STORAGE_SECRET_KEY: 'secret',
  AUDIO_PUBLIC_URL: 'https://media.example.com',
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

  it('rejects an unknown environment and malformed production origins', () => {
    expect(() => validateEnvironment({ NODE_ENV: 'prodution' })).toThrow(
      /NODE_ENV/u,
    )
    expect(() =>
      validateEnvironment({
        ...productionEnvironment,
        BETTER_AUTH_URL: 'https://api.example.com/unexpected',
      }),
    ).toThrow(/only the public origin/u)
  })

  it('validates the database driver and proxy hop count', () => {
    expect(() =>
      validateEnvironment({
        ...productionEnvironment,
        DATABASE_URL: 'mysql://db.example.com/language',
      }),
    ).toThrow(/PostgreSQL/u)
    expect(() => validateEnvironment({ TRUST_PROXY_HOPS: '20' })).toThrow(
      /TRUST_PROXY_HOPS/u,
    )
    expect(validateEnvironment({ TRUST_PROXY_HOPS: '1' })).toMatchObject({
      TRUST_PROXY_HOPS: 1,
    })
  })

  it('validates SMTP settings without requiring provider credentials', () => {
    expect(() =>
      validateEnvironment({
        SMTP_USER: 'mailer',
        SMTP_PASSWORD: undefined,
      }),
    ).toThrow(/provided together/u)
    expect(() => validateEnvironment({ SMTP_SECURE: 'sometimes' })).toThrow(
      /SMTP_SECURE/u,
    )
    expect(
      validateEnvironment({ SMTP_PORT: '465', SMTP_SECURE: 'true' }),
    ).toMatchObject({ SMTP_PORT: 465, SMTP_SECURE: true })
  })

  it('requires both Google OAuth credentials together', () => {
    expect(() =>
      validateEnvironment({ GOOGLE_CLIENT_ID: 'client-id' }),
    ).toThrow(/GOOGLE_CLIENT_SECRET/u)
    expect(() =>
      validateEnvironment({ GOOGLE_CLIENT_SECRET: 'client-secret' }),
    ).toThrow(/GOOGLE_CLIENT_ID/u)
  })

  it('accepts a complete production environment', () => {
    expect(
      validateEnvironment({ ...productionEnvironment, MEDIA_BASE_URL: '' }),
    ).toMatchObject({
      API_PORT: 8080,
      WEB_ORIGIN: 'https://learn.example.com',
    })
  })

  it('validates audio rates and production storage configuration', () => {
    expect(() =>
      validateEnvironment({ AUDIO_NORMAL_SPEAKING_RATE: 'fast' }),
    ).toThrow(/AUDIO_NORMAL_SPEAKING_RATE/u)
    expect(
      validateEnvironment({
        ...productionEnvironment,
        AUDIO_STORAGE_PROVIDER: 'local',
        AUDIO_PUBLIC_URL: '',
      }),
    ).toMatchObject({ AUDIO_STORAGE_PROVIDER: 'local' })
  })
})
