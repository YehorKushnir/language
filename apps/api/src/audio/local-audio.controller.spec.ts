import { ConfigService } from '@nestjs/config'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Response } from 'express'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LocalAudioController, parseByteRange } from './local-audio.controller'

let temporaryDirectory: string | undefined

afterEach(async () => {
  if (temporaryDirectory) {
    await rm(temporaryDirectory, { force: true, recursive: true })
    temporaryDirectory = undefined
  }
})

describe('parseByteRange', () => {
  it('parses the byte ranges used by mobile audio players', () => {
    expect(parseByteRange('bytes=0-1', 100)).toEqual({ start: 0, end: 1 })
    expect(parseByteRange('bytes=40-', 100)).toEqual({ start: 40, end: 99 })
    expect(parseByteRange('bytes=-20', 100)).toEqual({ start: 80, end: 99 })
    expect(parseByteRange('bytes=90-200', 100)).toEqual({
      start: 90,
      end: 99,
    })
  })

  it('rejects malformed and unsatisfiable ranges', () => {
    expect(parseByteRange('bytes=100-', 100)).toBeNull()
    expect(parseByteRange('bytes=30-20', 100)).toBeNull()
    expect(parseByteRange('bytes=0-1, 5-6', 100)).toBeNull()
    expect(parseByteRange('items=0-1', 100)).toBeNull()
  })
})

describe('LocalAudioController', () => {
  it('returns a partial audio stream with seekable response headers', async () => {
    const { controller, response } = await createController()

    const result = await controller.getAudio(
      ['audio', 'sample.mp3'],
      'bytes=2-5',
      response.value,
    )

    expect(result).toBeDefined()
    if (!result) throw new Error('Expected a partial audio stream')
    const chunks: Buffer[] = []
    for await (const chunk of result.getStream()) {
      chunks.push(Buffer.from(chunk))
    }
    expect(Buffer.concat(chunks).toString()).toBe('2345')
    expect(response.status).toHaveBeenCalledWith(206)
    expect(response.set).toHaveBeenCalledWith(
      expect.objectContaining({ 'Accept-Ranges': 'bytes' }),
    )
    expect(response.set).toHaveBeenCalledWith({
      'Content-Length': '4',
      'Content-Range': 'bytes 2-5/10',
    })
  })

  it('returns 416 for an unsatisfiable audio range', async () => {
    const { controller, response } = await createController()

    const result = await controller.getAudio(
      ['audio', 'sample.mp3'],
      'bytes=10-',
      response.value,
    )

    expect(result).toBeUndefined()
    expect(response.status).toHaveBeenCalledWith(416)
    expect(response.set).toHaveBeenCalledWith('Content-Range', 'bytes */10')
    expect(response.end).toHaveBeenCalledOnce()
  })
})

async function createController() {
  temporaryDirectory = await mkdtemp(join(tmpdir(), 'language-audio-'))
  await mkdir(join(temporaryDirectory, 'audio'))
  await writeFile(join(temporaryDirectory, 'audio/sample.mp3'), '0123456789')
  const config = {
    get: vi.fn((key: string, fallback?: string) => {
      if (key === 'AUDIO_LOCAL_DIRECTORY') return temporaryDirectory
      return fallback
    }),
  } as unknown as ConfigService
  const status = vi.fn()
  const set = vi.fn()
  const end = vi.fn()
  const value = { status, set, end } as unknown as Response
  status.mockReturnValue(value)
  set.mockReturnValue(value)

  return {
    controller: new LocalAudioController(config),
    response: { value, status, set, end },
  }
}
