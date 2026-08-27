import { describe, expect, it, vi } from 'vitest'

import { PrismaService } from '../database/prisma.service'
import {
  AudioBatchGenerationService,
  AudioGenerationService,
} from './audio-generation.service'
import { AudioSettingsService } from './audio-settings.service'

describe('AudioBatchGenerationService', () => {
  it('generates missing assets, counts cached assets and continues on errors', async () => {
    const prisma = {
      lexicalForm: {
        findMany: vi
          .fn()
          .mockResolvedValue([{ id: 'word.1' }, { id: 'word.2' }]),
      },
      exercise: {
        findMany: vi.fn().mockResolvedValue([{ id: 'sentence.1' }]),
      },
      text: { findMany: vi.fn().mockResolvedValue([{ id: 'text.1' }]) },
    }
    const generation = {
      generateWordAudio: vi
        .fn()
        .mockResolvedValueOnce({ cached: false })
        .mockResolvedValueOnce({ cached: true }),
      generateSentenceAudio: vi.fn().mockRejectedValue(new Error('bad voice')),
      generateTextAudio: vi.fn().mockResolvedValue({ cached: false }),
    }
    const settings = { batchConcurrency: 2 }
    const service = new AudioBatchGenerationService(
      prisma as unknown as PrismaService,
      generation as unknown as AudioGenerationService,
      settings as AudioSettingsService,
    )

    await expect(service.generateAll()).resolves.toEqual({
      words: { generated: 1, cached: 1, failed: 0 },
      sentences: { generated: 0, cached: 0, failed: 1 },
      texts: { generated: 1, cached: 0, failed: 0 },
    })
    expect(generation.generateTextAudio).toHaveBeenCalledOnce()
  })

  it('generates a limited sentence-only batch without scanning words', async () => {
    const findMany = vi
      .fn()
      .mockResolvedValue([{ id: 'sentence.1' }, { id: 'sentence.2' }])
    const prisma = {
      exercise: { findMany },
      lexicalForm: { findMany: vi.fn() },
    }
    const generation = {
      generateSentenceAudio: vi
        .fn()
        .mockResolvedValueOnce({ cached: false })
        .mockResolvedValueOnce({ cached: true }),
    }
    const service = new AudioBatchGenerationService(
      prisma as unknown as PrismaService,
      generation as unknown as AudioGenerationService,
      { batchConcurrency: 2 } as AudioSettingsService,
    )

    await expect(service.generateSentences(2)).resolves.toEqual({
      generated: 1,
      cached: 1,
      failed: 0,
    })
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 2 }))
    expect(prisma.lexicalForm.findMany).not.toHaveBeenCalled()
  })
})
