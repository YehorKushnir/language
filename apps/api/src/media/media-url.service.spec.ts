import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'

import { MediaUrlService } from './media-url.service'

describe('MediaUrlService', () => {
  it('resolves an object-storage key against the public media base', () => {
    const service = new MediaUrlService({
      get: () => 'https://media.example.test/course/',
    } as unknown as ConfigService)

    expect(service.resolve('audio/приветствие.mp3')).toBe(
      'https://media.example.test/course/audio/%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82%D1%81%D1%82%D0%B2%D0%B8%D0%B5.mp3',
    )
  })

  it('keeps same-origin and absolute URLs and hides unresolved keys', () => {
    const service = new MediaUrlService({
      get: () => undefined,
    } as unknown as ConfigService)

    expect(service.resolve('/audio/word.mp3')).toBe('/audio/word.mp3')
    expect(service.resolve('https://cdn.example.test/word.mp3')).toBe(
      'https://cdn.example.test/word.mp3',
    )
    expect(service.resolve('audio/private-key.mp3')).toBeNull()
  })
})
