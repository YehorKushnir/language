import type { AudioAsset } from '@language/database'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PrismaService } from '../database/prisma.service'
import { AudioService } from './audio.service'
import { AudioSettingsService } from './audio-settings.service'
import type { TextToSpeechProvider } from './audio.types'
import { LocalObjectStorage } from './object-storage'

describe('audio flow integration', () => {
  let directory: string | undefined

  afterEach(async () => {
    if (directory) await rm(directory, { recursive: true, force: true })
    directory = undefined
  })

  it('persists mock TTS output in storage and AudioAsset metadata', async () => {
    directory = await mkdtemp(join(tmpdir(), 'language-audio-flow-'))
    const assets: AudioAsset[] = []
    const findUnique = async ({ where }: { where: { cacheKey: string } }) =>
      assets.find((asset) => asset.cacheKey === where.cacheKey) ?? null
    const transaction = {
      $queryRaw: vi.fn(),
      audioAsset: {
        findUnique,
        create: async ({ data }: { data: AudioAsset }) => {
          const asset = {
            ...data,
            durationMs: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          assets.push(asset)
          return asset
        },
      },
    }
    const prisma = {
      audioAsset: { findUnique },
      $transaction: async (
        operation: (client: typeof transaction) => Promise<unknown>,
      ) => operation(transaction),
    }
    const tts = {
      name: 'google',
      getCapabilities: vi.fn(() => ({ serverSpeakingRate: false })),
      synthesize: vi.fn().mockResolvedValue({
        buffer: Buffer.from('mock mp3'),
        contentType: 'audio/mpeg',
        extension: 'mp3',
      }),
    }
    const service = new AudioService(
      prisma as unknown as PrismaService,
      tts as unknown as TextToSpeechProvider,
      new LocalObjectStorage(directory),
      {
        language: 'fi-FI',
        voice: 'fi-FI-test',
        normalSpeakingRate: 1,
        generationVersion: 'v1',
      } as AudioSettingsService,
    )

    const result = await service.getOrCreateAudio({ text: 'Minä olen täällä.' })

    expect(result.url).toMatch(/^\/api\/v1\/media\/audio\/fi-FI/u)
    expect(assets[0]).toMatchObject({
      provider: 'google',
      language: 'fi-FI',
      voice: 'fi-FI-test',
      sourceText: 'Minä olen täällä.',
      speakingRate: null,
      contentType: 'audio/mpeg',
    })
    expect(await readFile(join(directory, result.storageKey), 'utf8')).toBe(
      'mock mp3',
    )
  })
})
