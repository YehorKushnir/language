const DEFAULT_API_URL = '/api/v1'

export function getApiUrl(configuredUrl: string | undefined) {
  return configuredUrl?.replace(/\/$/, '') || DEFAULT_API_URL
}
