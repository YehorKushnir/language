import { DatabaseClient } from '@language/database'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { PrismaService } from '../database/prisma.service'
import { AudioService } from './audio.service'
import { AudioSettingsService } from './audio-settings.service'
import type { TextToSpeechProvider } from './audio.types'
import { LocalObjectStorage } from './object-storage'

const databaseIntegration = describe.runIf(
  process.env.RUN_DATABASE_INTEGRATION === 'true',
)

databaseIntegration('audio database integration', () => {
  const database = new DatabaseClient()
  const assetIds: string[] = []
  let directory: string | undefined

  beforeAll(async () => {
    await database.audioAsset.deleteMany({
      where: { generationVersion: 'integration-v1' },
    })
  })

  afterEach(async () => {
    if (assetIds.length > 0) {
      await database.audioAsset.deleteMany({
        where: { id: { in: assetIds.splice(0) } },
      })
    }
    if (directory) await rm(directory, { recursive: true, force: true })
    directory = undefined
  })

  afterAll(async () => database.$disconnect())

  it('stores mock TTS metadata in PostgreSQL and bytes in test storage', async () => {
    directory = await mkdtemp(join(tmpdir(), 'language-audio-database-'))
    const tts = {
      name: 'google',
      getCapabilities: vi.fn(() => ({ serverSpeakingRate: false })),
      synthesize: vi.fn().mockResolvedValue({
        buffer: Buffer.from('database integration mp3'),
        contentType: 'audio/mpeg',
        extension: 'mp3',
      }),
    }
    const service = new AudioService(
      database as unknown as PrismaService,
      tts as unknown as TextToSpeechProvider,
      new LocalObjectStorage(directory),
      {
        language: 'fi-FI',
        voice: 'fi-FI-integration',
        normalSpeakingRate: 1,
        generationVersion: 'integration-v1',
      } as AudioSettingsService,
    )

    const result = await service.getOrCreateAudio({
      text: `Integraatiotesti ${crypto.randomUUID()}`,
    })
    assetIds.push(result.id)

    await expect(
      database.audioAsset.findUnique({ where: { id: result.id } }),
    ).resolves.toMatchObject({
      provider: 'google',
      language: 'fi-FI',
      voice: 'fi-FI-integration',
      contentType: 'audio/mpeg',
      url: result.url,
    })
    expect(await readFile(join(directory, result.storageKey), 'utf8')).toBe(
      'database integration mp3',
    )
  })

  it('deduplicates concurrent cache misses across service instances', async () => {
    directory = await mkdtemp(join(tmpdir(), 'language-audio-race-'))
    const tts = {
      name: 'google',
      getCapabilities: vi.fn(() => ({ serverSpeakingRate: false })),
      synthesize: vi.fn().mockResolvedValue({
        buffer: Buffer.from('race mp3'),
        contentType: 'audio/mpeg',
        extension: 'mp3',
      }),
    }
    const settings = {
      language: 'fi-FI',
      voice: 'fi-FI-integration',
      normalSpeakingRate: 1,
      generationVersion: 'integration-v1',
    } as AudioSettingsService
    const storage = new LocalObjectStorage(directory)
    const firstService = new AudioService(
      database as unknown as PrismaService,
      tts as unknown as TextToSpeechProvider,
      storage,
      settings,
    )
    const secondService = new AudioService(
      database as unknown as PrismaService,
      tts as unknown as TextToSpeechProvider,
      storage,
      settings,
    )
    const text = `Rinnakkaistesti ${crypto.randomUUID()}`

    const [first, second] = await Promise.all([
      firstService.getOrCreateAudio({ text }),
      secondService.getOrCreateAudio({ text }),
    ])
    assetIds.push(first.id)

    expect(first.id).toBe(second.id)
    expect(tts.synthesize).toHaveBeenCalledOnce()
    await expect(
      database.audioAsset.count({ where: { cacheKey: first.cacheKey } }),
    ).resolves.toBe(1)
  })
})
