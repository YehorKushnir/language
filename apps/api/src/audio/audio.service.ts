import { Prisma, type AudioAsset } from '@language/database'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { createHash, randomUUID } from 'node:crypto'

import { PrismaService } from '../database/prisma.service'
import { AudioSettingsService } from './audio-settings.service'
import {
  AUDIO_OBJECT_STORAGE,
  type AudioAssetResult,
  type ObjectStorage,
  TEXT_TO_SPEECH_PROVIDER,
  type TextToSpeechProvider,
} from './audio.types'

export interface GetOrCreateAudioInput {
  text: string
  language?: string
  voice?: string
  speakingRate?: number
}

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name)
  private readonly pending = new Map<string, Promise<AudioAssetResult>>()

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(TEXT_TO_SPEECH_PROVIDER)
    private readonly tts: TextToSpeechProvider,
    @Inject(AUDIO_OBJECT_STORAGE) private readonly storage: ObjectStorage,
    @Inject(AudioSettingsService)
    private readonly settings: AudioSettingsService,
  ) {}

  async getOrCreateAudio(
    input: GetOrCreateAudioInput,
  ): Promise<AudioAssetResult> {
    const normalizedText = normalizeAudioText(input.text)
    if (!normalizedText) throw new Error('Audio source text cannot be empty')

    const language = input.language ?? this.settings.language
    const voice = input.voice ?? this.settings.voice
    const requestedSpeakingRate =
      input.speakingRate ?? this.settings.normalSpeakingRate
    validateSpeakingRate(requestedSpeakingRate)
    const capabilities = this.tts.getCapabilities({ language, voice })
    const speakingRate = capabilities.serverSpeakingRate
      ? requestedSpeakingRate
      : undefined
    const generationVersion = this.settings.generationVersion
    const cacheKey = calculateAudioCacheKey({
      provider: this.tts.name,
      language,
      voice,
      speakingRate,
      normalizedText,
      generationVersion,
    })

    const existing = await this.prisma.audioAsset.findUnique({
      where: { cacheKey },
    })
    if (existing) return toResult(existing, true)

    const activeRequest = this.pending.get(cacheKey)
    if (activeRequest) return activeRequest

    const request = this.createUnderDatabaseLock({
      normalizedText,
      language,
      voice,
      speakingRate,
      generationVersion,
      cacheKey,
    }).finally(() => this.pending.delete(cacheKey))
    this.pending.set(cacheKey, request)
    return request
  }

  private async createUnderDatabaseLock(input: {
    normalizedText: string
    language: string
    voice: string
    speakingRate?: number
    generationVersion: string
    cacheKey: string
  }): Promise<AudioAssetResult> {
    return this.prisma.$transaction(
      async (transaction) => {
        await transaction.$queryRaw(
          Prisma.sql`SELECT 1 AS "locked" FROM pg_advisory_xact_lock(hashtextextended(${input.cacheKey}, 0))`,
        )
        const existing = await transaction.audioAsset.findUnique({
          where: { cacheKey: input.cacheKey },
        })
        if (existing) return toResult(existing, true)

        let synthesized: Awaited<ReturnType<TextToSpeechProvider['synthesize']>>
        try {
          synthesized = await this.tts.synthesize({
            text: input.normalizedText,
            language: input.language,
            voice: input.voice,
            ...(input.speakingRate === undefined
              ? {}
              : { speakingRate: input.speakingRate }),
          })
        } catch (error) {
          this.logger.error(
            `TTS synthesis failed for cache key ${input.cacheKey}`,
            error instanceof Error ? error.stack : String(error),
          )
          throw error
        }

        const textHash = sha256(input.normalizedText)
        const checksum = sha256(synthesized.buffer)
        const safeLanguage = sanitizePathSegment(input.language)
        const safeVoice = sanitizePathSegment(input.voice)
        const storageKey = `audio/${safeLanguage}/${safeVoice}/${input.cacheKey}.${sanitizeExtension(synthesized.extension)}`
        let uploaded = false
        try {
          await this.storage.upload({
            key: storageKey,
            buffer: synthesized.buffer,
            contentType: synthesized.contentType,
          })
          uploaded = true
          const asset = await transaction.audioAsset.create({
            data: {
              id: randomUUID(),
              provider: this.tts.name,
              language: input.language,
              voice: input.voice,
              textHash,
              sourceText: input.normalizedText,
              speakingRate: input.speakingRate ?? null,
              generationVersion: input.generationVersion,
              cacheKey: input.cacheKey,
              storageKey,
              url: this.storage.getPublicUrl(storageKey),
              contentType: synthesized.contentType,
              checksum,
            },
          })
          return toResult(asset, false)
        } catch (error) {
          if (uploaded) {
            try {
              await this.storage.delete(storageKey)
            } catch (cleanupError) {
              this.logger.warn(
                `Could not remove orphaned audio object ${storageKey}: ${String(cleanupError)}`,
              )
            }
          }
          this.logger.error(
            `Audio persistence failed for cache key ${input.cacheKey}`,
            error instanceof Error ? error.stack : String(error),
          )
          throw error
        }
      },
      { maxWait: 60_000, timeout: 120_000 },
    )
  }
}

export function normalizeAudioText(text: string): string {
  return text.normalize('NFC').replace(/\s+/gu, ' ').trim()
}

export function calculateAudioCacheKey(input: {
  provider: string
  language: string
  voice: string
  speakingRate?: number
  normalizedText: string
  generationVersion?: string
}): string {
  const dimensions = [
    input.generationVersion ?? 'v1',
    input.provider,
    input.language,
    input.voice,
  ]
  if (input.speakingRate !== undefined) {
    dimensions.push(canonicalSpeakingRate(input.speakingRate))
  }
  dimensions.push(input.normalizedText)
  return sha256(dimensions.join(':'))
}

function canonicalSpeakingRate(value: number): string {
  validateSpeakingRate(value)
  return String(Number(value.toFixed(4)))
}

function validateSpeakingRate(value: number): void {
  if (!Number.isFinite(value) || value < 0.25 || value > 4) {
    throw new Error('speakingRate must be between 0.25 and 4')
  }
}

function sha256(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex')
}

function sanitizePathSegment(value: string): string {
  const safe = value.normalize('NFKC').replace(/[^a-zA-Z0-9._-]+/gu, '-')
  return safe.replace(/^-+|-+$/gu, '') || 'default'
}

function sanitizeExtension(value: string): string {
  const safe = value.toLowerCase().replace(/[^a-z0-9]/gu, '')
  if (!safe) throw new Error('TTS provider returned an invalid extension')
  return safe
}

function toResult(asset: AudioAsset, cached: boolean): AudioAssetResult {
  return {
    id: asset.id,
    cacheKey: asset.cacheKey,
    storageKey: asset.storageKey,
    url: asset.url,
    contentType: asset.contentType,
    cached,
  }
}
