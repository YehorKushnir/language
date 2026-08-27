import { ContentStatus, ExerciseKind } from '@language/database'
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'

import { PrismaService } from '../database/prisma.service'
import { AudioService } from './audio.service'
import { AudioSettingsService } from './audio-settings.service'
import type { AudioAssetResult } from './audio.types'

export type AudioVariant = 'standard' | 'normal'

export interface AudioBatchCounters {
  generated: number
  cached: number
  failed: number
}

export interface AudioBatchSummary {
  words: AudioBatchCounters
  sentences: AudioBatchCounters
  texts: AudioBatchCounters
}

@Injectable()
export class AudioGenerationService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AudioService) private readonly audio: AudioService,
    @Inject(AudioSettingsService)
    private readonly settings: AudioSettingsService,
  ) {}

  async generateWordAudio(wordId: string): Promise<AudioAssetResult> {
    const form = await this.prisma.lexicalForm.findUnique({
      where: { id: wordId },
      select: {
        id: true,
        surface: true,
        lexicalEntry: { select: { languageCode: true } },
      },
    })
    if (!form) throw new NotFoundException(`Lexical form ${wordId} not found`)

    const result = await this.audio.getOrCreateAudio({
      text: form.surface,
      language: toLanguageLocale(form.lexicalEntry.languageCode, this.settings),
    })
    await this.prisma.lexicalFormAudioAsset.upsert({
      where: {
        lexicalFormId_variant: {
          lexicalFormId: form.id,
          variant: 'standard',
        },
      },
      create: {
        lexicalFormId: form.id,
        audioAssetId: result.id,
        variant: 'standard',
      },
      update: { audioAssetId: result.id },
    })
    return result
  }

  async generateSentenceAudio(exerciseId: string): Promise<AudioAssetResult> {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
      select: { id: true, targetLanguage: true, targetText: true },
    })
    if (!exercise) {
      throw new NotFoundException(`Exercise ${exerciseId} not found`)
    }

    const result = await this.audio.getOrCreateAudio({
      text: exercise.targetText,
      language: toLanguageLocale(exercise.targetLanguage, this.settings),
    })
    await this.prisma.exerciseAudioAsset.upsert({
      where: {
        exerciseId_variant: { exerciseId: exercise.id, variant: 'standard' },
      },
      create: {
        exerciseId: exercise.id,
        audioAssetId: result.id,
        variant: 'standard',
      },
      update: { audioAssetId: result.id },
    })
    return result
  }

  async generateTextAudio(textId: string): Promise<AudioAssetResult> {
    const text = await this.prisma.text.findUnique({
      where: { id: textId },
      select: {
        id: true,
        body: true,
        course: { select: { targetLanguage: true } },
      },
    })
    if (!text) throw new NotFoundException(`Text ${textId} not found`)

    const result = await this.audio.getOrCreateAudio({
      text: text.body,
      language: toLanguageLocale(text.course.targetLanguage, this.settings),
    })
    await this.prisma.textAudioAsset.upsert({
      where: { textId_variant: { textId: text.id, variant: 'normal' } },
      create: {
        textId: text.id,
        audioAssetId: result.id,
        variant: 'normal',
      },
      update: { audioAssetId: result.id },
    })
    return result
  }
}

@Injectable()
export class AudioBatchGenerationService {
  private readonly logger = new Logger(AudioBatchGenerationService.name)

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AudioGenerationService)
    private readonly generation: AudioGenerationService,
    @Inject(AudioSettingsService)
    private readonly settings: AudioSettingsService,
  ) {}

  async generateWords(limit?: number): Promise<AudioBatchCounters> {
    const words = await this.prisma.lexicalForm.findMany({
      where: {
        lexicalEntry: { status: ContentStatus.CURATED, languageCode: 'fi' },
      },
      orderBy: { id: 'asc' },
      select: { id: true },
      ...(limit === undefined ? {} : { take: limit }),
    })
    const counters = emptyCounters()
    await mapWithConcurrency(
      words,
      this.settings.batchConcurrency,
      async ({ id }) =>
        this.record(counters, `word ${id}`, () =>
          this.generation.generateWordAudio(id),
        ),
    )
    return counters
  }

  async generateSentences(limit?: number): Promise<AudioBatchCounters> {
    const sentences = await this.prisma.exercise.findMany({
      where: {
        kind: ExerciseKind.PREPARED,
        status: ContentStatus.CURATED,
        targetLanguage: 'fi',
      },
      orderBy: { id: 'asc' },
      select: { id: true },
      ...(limit === undefined ? {} : { take: limit }),
    })
    const counters = emptyCounters()
    await mapWithConcurrency(
      sentences,
      this.settings.batchConcurrency,
      async ({ id }) =>
        this.record(counters, `sentence ${id}`, () =>
          this.generation.generateSentenceAudio(id),
        ),
    )
    return counters
  }

  async generateTexts(limit?: number): Promise<AudioBatchCounters> {
    const texts = await this.prisma.text.findMany({
      where: {
        status: ContentStatus.CURATED,
        course: { targetLanguage: 'fi' },
      },
      orderBy: { id: 'asc' },
      select: { id: true },
      ...(limit === undefined ? {} : { take: limit }),
    })
    const counters = emptyCounters()
    await mapWithConcurrency(
      texts,
      this.settings.batchConcurrency,
      async ({ id }) =>
        this.record(counters, `text ${id}`, () =>
          this.generation.generateTextAudio(id),
        ),
    )
    return counters
  }

  async generateAll(): Promise<AudioBatchSummary> {
    return {
      words: await this.generateWords(),
      sentences: await this.generateSentences(),
      texts: await this.generateTexts(),
    }
  }

  private async record(
    counters: AudioBatchCounters,
    label: string,
    generate: () => Promise<AudioAssetResult>,
  ): Promise<void> {
    try {
      const result = await generate()
      counters[result.cached ? 'cached' : 'generated'] += 1
    } catch (error) {
      counters.failed += 1
      this.logger.error(
        `Failed to generate ${label}`,
        error instanceof Error ? error.stack : String(error),
      )
    }
  }
}

function toLanguageLocale(
  languageCode: string,
  settings: AudioSettingsService,
): string {
  if (languageCode === 'fi') return settings.language
  return languageCode
}

function emptyCounters(): AudioBatchCounters {
  return { generated: 0, cached: 0, failed: 0 }
}

async function mapWithConcurrency<T>(
  values: T[],
  concurrency: number,
  operation: (value: T) => Promise<void>,
): Promise<void> {
  let nextIndex = 0
  const workers = Array.from(
    { length: Math.min(concurrency, values.length) },
    async () => {
      while (nextIndex < values.length) {
        const value = values[nextIndex]
        nextIndex += 1
        if (value) await operation(value)
      }
    },
  )
  await Promise.all(workers)
}
