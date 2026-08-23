import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MediaUrlService {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  resolve(storageKey: string | null | undefined): string | null {
    if (!storageKey) return null
    if (storageKey.startsWith('/')) return storageKey

    try {
      const absolute = new URL(storageKey)
      if (absolute.protocol === 'http:' || absolute.protocol === 'https:') {
        return absolute.toString()
      }
    } catch {
      // A storage key is expected to be relative and is resolved below.
    }

    const configuredBase = this.config.get<string>('MEDIA_BASE_URL')
    if (!configuredBase) return null
    const base = configuredBase.endsWith('/')
      ? configuredBase
      : `${configuredBase}/`
    const encodedKey = storageKey
      .split('/')
      .filter(Boolean)
      .map((segment) => encodeURIComponent(segment))
      .join('/')
    return new URL(encodedKey, base).toString()
  }
}
