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
  result.TRUST_PROXY_HOPS = parseInteger(
    'TRUST_PROXY_HOPS',
    environment.TRUST_PROXY_HOPS,
    0,
    5,
    0,
  )

  if (environment.NODE_ENV !== 'production') return result

  const required = [
    'DATABASE_URL',
    'WEB_ORIGIN',
    'BETTER_AUTH_URL',
    'BETTER_AUTH_SECRET',
  ] as const
  const missing = required.filter(
    (key) => typeof environment[key] !== 'string' || !environment[key]?.trim(),
  )
  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(', ')}`,
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

function parseUrl(key: string, value: string): URL {
  try {
    return new URL(value)
  } catch {
    throw new Error(`${key} must be an absolute URL`)
  }
}
