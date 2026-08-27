const DEVELOPMENT_AUTH_SECRET = 'development-only-change-me-32-characters'

export function validateEnvironment(
  environment: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...environment }
  if (
    environment.NODE_ENV !== undefined &&
    !['development', 'test', 'production'].includes(
      String(environment.NODE_ENV),
    )
  ) {
    throw new Error('NODE_ENV must be development, test or production')
  }
  const port = parsePort(environment.API_PORT)
  result.API_PORT = port
  result.SMTP_PORT = parseInteger(
    'SMTP_PORT',
    environment.SMTP_PORT,
    1,
    65_535,
    587,
  )
  result.SMTP_SECURE = parseBoolean(
    'SMTP_SECURE',
    environment.SMTP_SECURE,
    false,
  )
  result.TRUST_PROXY_HOPS = parseInteger(
    'TRUST_PROXY_HOPS',
    environment.TRUST_PROXY_HOPS,
    0,
    5,
    0,
  )
  result.AUDIO_NORMAL_SPEAKING_RATE = parseNumber(
    'AUDIO_NORMAL_SPEAKING_RATE',
    environment.AUDIO_NORMAL_SPEAKING_RATE,
    0.25,
    4,
    1,
  )
  result.AUDIO_GENERATION_CONCURRENCY = parseInteger(
    'AUDIO_GENERATION_CONCURRENCY',
    environment.AUDIO_GENERATION_CONCURRENCY,
    1,
    32,
    4,
  )
  result.GOOGLE_TTS_CHIRP3_MIN_INTERVAL_MS = parseInteger(
    'GOOGLE_TTS_CHIRP3_MIN_INTERVAL_MS',
    environment.GOOGLE_TTS_CHIRP3_MIN_INTERVAL_MS,
    0,
    60_000,
    310,
  )

  const ttsProvider = String(environment.TTS_PROVIDER ?? 'google')
  if (ttsProvider !== 'google') {
    throw new Error('TTS_PROVIDER must be google')
  }
  result.TTS_PROVIDER = ttsProvider
  const googleTtsAuthMode = String(environment.GOOGLE_TTS_AUTH_MODE ?? 'adc')
  if (!['adc', 'gcloud'].includes(googleTtsAuthMode)) {
    throw new Error('GOOGLE_TTS_AUTH_MODE must be adc or gcloud')
  }
  if (environment.NODE_ENV === 'production' && googleTtsAuthMode !== 'adc') {
    throw new Error('GOOGLE_TTS_AUTH_MODE must be adc in production')
  }
  result.GOOGLE_TTS_AUTH_MODE = googleTtsAuthMode
  const storageProvider = String(environment.AUDIO_STORAGE_PROVIDER ?? 'local')
  if (!['local', 's3', 'r2'].includes(storageProvider)) {
    throw new Error('AUDIO_STORAGE_PROVIDER must be local, s3 or r2')
  }
  result.AUDIO_STORAGE_PROVIDER = storageProvider

  const hasSmtpUser = hasText(environment.SMTP_USER)
  const hasSmtpPassword = hasText(environment.SMTP_PASSWORD)
  if (hasSmtpUser !== hasSmtpPassword) {
    throw new Error('SMTP_USER and SMTP_PASSWORD must be provided together')
  }

  if (environment.NODE_ENV !== 'production') return result

  const required = [
    'DATABASE_URL',
    'WEB_ORIGIN',
    'BETTER_AUTH_URL',
    'BETTER_AUTH_SECRET',
    'SMTP_HOST',
    'MAIL_FROM',
  ] as const
  const missing = required.filter(
    (key) => typeof environment[key] !== 'string' || !environment[key]?.trim(),
  )
  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(', ')}`,
    )
  }

  const audioRequired = ['GOOGLE_TTS_PROJECT_ID', 'GOOGLE_TTS_VOICE']
  if (storageProvider !== 'local') {
    audioRequired.push(
      'AUDIO_STORAGE_BUCKET',
      'AUDIO_STORAGE_ACCESS_KEY',
      'AUDIO_STORAGE_SECRET_KEY',
      'AUDIO_PUBLIC_URL',
    )
    if (storageProvider === 'r2') audioRequired.push('AUDIO_STORAGE_ENDPOINT')
  }
  const missingAudio = audioRequired.filter((key) => !hasText(environment[key]))
  if (missingAudio.length > 0) {
    throw new Error(
      `Missing required production audio variables: ${missingAudio.join(', ')}`,
    )
  }

  const secret = String(environment.BETTER_AUTH_SECRET)
  if (secret.length < 32 || secret === DEVELOPMENT_AUTH_SECRET) {
    throw new Error(
      'BETTER_AUTH_SECRET must be a unique production secret of at least 32 characters',
    )
  }

  const databaseUrl = parseUrl('DATABASE_URL', String(environment.DATABASE_URL))
  if (!['postgres:', 'postgresql:'].includes(databaseUrl.protocol)) {
    throw new Error('DATABASE_URL must use PostgreSQL')
  }

  for (const key of ['WEB_ORIGIN', 'BETTER_AUTH_URL'] as const) {
    const url = parseUrl(key, String(environment[key]))
    if (url.protocol !== 'https:') {
      throw new Error(`${key} must use HTTPS in production`)
    }
    if (
      url.pathname !== '/' ||
      url.search ||
      url.hash ||
      url.username ||
      url.password
    ) {
      throw new Error(`${key} must contain only the public origin`)
    }
  }

  if (
    typeof environment.MEDIA_BASE_URL === 'string' &&
    environment.MEDIA_BASE_URL.trim()
  ) {
    const mediaUrl = parseUrl('MEDIA_BASE_URL', environment.MEDIA_BASE_URL)
    if (mediaUrl.protocol !== 'https:') {
      throw new Error('MEDIA_BASE_URL must use HTTPS in production')
    }
  }

  const audioPublicUrl = parseUrl(
    'AUDIO_PUBLIC_URL',
    String(environment.AUDIO_PUBLIC_URL),
  )
  if (audioPublicUrl.protocol !== 'https:') {
    throw new Error('AUDIO_PUBLIC_URL must use HTTPS in production')
  }

  return result
}

function parsePort(value: unknown): number {
  if (value === undefined || value === '') return 3000
  const port = Number(value)
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('API_PORT must be an integer between 1 and 65535')
  }
  return port
}

function parseInteger(
  key: string,
  value: unknown,
  minimum: number,
  maximum: number,
  fallback: number,
): number {
  if (value === undefined || value === '') return fallback
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(
      `${key} must be an integer between ${minimum} and ${maximum}`,
    )
  }
  return parsed
}

function parseNumber(
  key: string,
  value: unknown,
  minimum: number,
  maximum: number,
  fallback: number,
): number {
  if (value === undefined || value === '') return fallback
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${key} must be a number between ${minimum} and ${maximum}`)
  }
  return parsed
}

function parseUrl(key: string, value: string): URL {
  try {
    return new URL(value)
  } catch {
    throw new Error(`${key} must be an absolute URL`)
  }
}

function parseBoolean(key: string, value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  throw new Error(`${key} must be true or false`)
}

function hasText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}
