import type { AudioAsset } from '@language/database'
import { describe, expect, it, vi } from 'vitest'

import { PrismaService } from '../database/prisma.service'
import {
  AudioService,
  calculateAudioCacheKey,
  normalizeAudioText,
} from './audio.service'
import { AudioSettingsService } from './audio-settings.service'
import type { ObjectStorage, TextToSpeechProvider } from './audio.types'

describe('AudioService', () => {
  it('synthesizes once and uses the database cache afterwards', async () => {
    const fixture = createFixture()

    const first = await fixture.service.getOrCreateAudio({ text: '  talo  ' })
    const second = await fixture.service.getOrCreateAudio({ text: 'talo' })

    expect(first.cached).toBe(false)
    expect(second).toMatchObject({ id: first.id, cached: true })
    expect(fixture.tts.synthesize).toHaveBeenCalledOnce()
    expect(fixture.storage.upload).toHaveBeenCalledOnce()
    expect(fixture.assets).toHaveLength(1)
  })

  it.each([
    ['voice', { voice: 'fi-FI-other' }],
    ['language', { language: 'sv-SE' }],
  ])('creates a distinct asset for a different %s', async (_, change) => {
    const fixture = createFixture()
    await fixture.service.getOrCreateAudio({ text: 'talo' })
    await fixture.service.getOrCreateAudio({ text: 'talo', ...change })

    expect(fixture.tts.synthesize).toHaveBeenCalledTimes(2)
    expect(fixture.assets).toHaveLength(2)
    expect(fixture.assets[0]?.cacheKey).not.toBe(fixture.assets[1]?.cacheKey)
  })

  it('reuses the canonical Chirp asset when only speaking rate changes', async () => {
    const fixture = createFixture({ serverSpeakingRate: false })

    const normal = await fixture.service.getOrCreateAudio({ text: 'talo' })
    const slow = await fixture.service.getOrCreateAudio({
      text: 'talo',
      speakingRate: 0.85,
    })

    expect(slow).toMatchObject({ id: normal.id, cached: true })
    expect(fixture.tts.synthesize).toHaveBeenCalledOnce()
    expect(fixture.tts.synthesize.mock.calls[0]?.[0]).not.toHaveProperty(
      'speakingRate',
    )
    expect(fixture.assets[0]?.speakingRate).toBeNull()
  })

  it('keeps speaking rate in the cache for providers that synthesize it', async () => {
    const fixture = createFixture({ serverSpeakingRate: true })
    await fixture.service.getOrCreateAudio({ text: 'talo' })
    await fixture.service.getOrCreateAudio({ text: 'talo', speakingRate: 0.85 })

    expect(fixture.tts.synthesize).toHaveBeenCalledTimes(2)
    expect(fixture.assets).toHaveLength(2)
    expect(fixture.assets[0]?.cacheKey).not.toBe(fixture.assets[1]?.cacheKey)
  })

  it('does not persist anything when TTS fails', async () => {
    const fixture = createFixture()
    fixture.tts.synthesize.mockRejectedValueOnce(new Error('unavailable'))

    await expect(
      fixture.service.getOrCreateAudio({ text: 'talo' }),
    ).rejects.toThrow('unavailable')
    expect(fixture.assets).toHaveLength(0)
    expect(fixture.storage.upload).not.toHaveBeenCalled()
  })

  it('does not persist anything when storage upload fails', async () => {
    const fixture = createFixture()
    fixture.storage.upload.mockRejectedValueOnce(new Error('upload failed'))

    await expect(
      fixture.service.getOrCreateAudio({ text: 'talo' }),
    ).rejects.toThrow('upload failed')
    expect(fixture.assets).toHaveLength(0)
    expect(fixture.storage.delete).not.toHaveBeenCalled()
  })

  it('removes the uploaded object when database creation fails', async () => {
    const fixture = createFixture({ createFails: true })

    await expect(
      fixture.service.getOrCreateAudio({ text: 'talo' }),
    ).rejects.toThrow('database failed')
    expect(fixture.storage.delete).toHaveBeenCalledOnce()
    expect(fixture.assets).toHaveLength(0)
  })

  it('coalesces parallel requests for the same uncached audio', async () => {
    const fixture = createFixture()
    let release: (() => void) | undefined
    fixture.tts.synthesize.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = () =>
            resolve({
              buffer: Buffer.from('audio'),
              contentType: 'audio/mpeg',
              extension: 'mp3',
            })
        }),
    )

    const first = fixture.service.getOrCreateAudio({ text: 'talo' })
    const second = fixture.service.getOrCreateAudio({ text: 'talo' })
    await vi.waitFor(() => expect(release).toBeTypeOf('function'))
    release?.()

    const results = await Promise.all([first, second])
    expect(results[0]?.id).toBe(results[1]?.id)
    expect(fixture.tts.synthesize).toHaveBeenCalledOnce()
    expect(fixture.assets).toHaveLength(1)
  })

  it('forms a deterministic key from normalized text and all dimensions', () => {
    const normalized = normalizeAudioText('  Minä\n  olen  ')
    expect(normalized).toBe('Minä olen')
    const input = {
      provider: 'google',
      language: 'fi-FI',
      voice: 'fi-FI-test',
      speakingRate: 1,
      normalizedText: normalized,
      generationVersion: 'v1',
    }

    expect(calculateAudioCacheKey(input)).toBe(
      calculateAudioCacheKey({ ...input }),
    )
    expect(calculateAudioCacheKey(input)).toMatch(/^[a-f0-9]{64}$/u)
    expect(calculateAudioCacheKey(input)).not.toBe(
      calculateAudioCacheKey({ ...input, generationVersion: 'v2' }),
    )
  })
})

function createFixture(
  options: { createFails?: boolean; serverSpeakingRate?: boolean } = {},
) {
  const assets: AudioAsset[] = []
  const findUnique = vi.fn(
    async ({ where }: { where: { cacheKey: string } }) =>
      assets.find((asset) => asset.cacheKey === where.cacheKey) ?? null,
  )
  const create = vi.fn(async ({ data }: { data: AudioAsset }) => {
    if (options.createFails) throw new Error('database failed')
    const asset = {
      ...data,
      durationMs: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    assets.push(asset)
    return asset
  })
  const transaction = {
    $queryRaw: vi.fn().mockResolvedValue([{ pg_advisory_xact_lock: null }]),
    audioAsset: { findUnique, create },
  }
  const prisma = {
    audioAsset: { findUnique },
    $transaction: vi.fn(
      async (operation: (client: typeof transaction) => Promise<unknown>) =>
        operation(transaction),
    ),
  }
  const tts = {
    name: 'google',
    getCapabilities: vi.fn(() => ({
      serverSpeakingRate: options.serverSpeakingRate ?? false,
    })),
    synthesize: vi.fn().mockResolvedValue({
      buffer: Buffer.from('audio'),
      contentType: 'audio/mpeg',
      extension: 'mp3',
    }),
  }
  const storage = {
    upload: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    getPublicUrl: vi.fn((key: string) => `https://media.test/${key}`),
  }
  const settings = {
    language: 'fi-FI',
    voice: 'fi-FI-test',
    normalSpeakingRate: 1,
    generationVersion: 'v1',
  }
  const service = new AudioService(
    prisma as unknown as PrismaService,
    tts as unknown as TextToSpeechProvider,
    storage as unknown as ObjectStorage,
    settings as AudioSettingsService,
  )
  return { assets, prisma, service, storage, tts }
}
