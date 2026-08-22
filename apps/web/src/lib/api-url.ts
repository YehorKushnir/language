const DEFAULT_API_URL = 'http://localhost:3000/api/v1'

export function getApiUrl(configuredUrl: string | undefined) {
  return configuredUrl?.replace(/\/$/, '') || DEFAULT_API_URL
}
