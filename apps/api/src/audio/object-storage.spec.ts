import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { LocalObjectStorage } from './object-storage'

describe('LocalObjectStorage', () => {
  const directories: string[] = []

  afterEach(async () => {
    await Promise.all(
      directories
        .splice(0)
        .map((directory) => rm(directory, { recursive: true, force: true })),
    )
  })

  it('uploads, resolves and deletes an object under the configured root', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'language-audio-'))
    directories.push(directory)
    const storage = new LocalObjectStorage(directory)

    await storage.upload({
      key: 'audio/fi-FI/voice/hash.mp3',
      buffer: Buffer.from('audio bytes'),
      contentType: 'audio/mpeg',
    })
    expect(
      await readFile(join(directory, 'audio/fi-FI/voice/hash.mp3'), 'utf8'),
    ).toBe('audio bytes')
    expect(storage.getPublicUrl('audio/fi-FI/voice/hash.mp3')).toBe(
      '/api/v1/media/audio/fi-FI/voice/hash.mp3',
    )
    await storage.delete('audio/fi-FI/voice/hash.mp3')
    await expect(
      readFile(join(directory, 'audio/fi-FI/voice/hash.mp3')),
    ).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('rejects keys that escape the storage root', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'language-audio-'))
    directories.push(directory)
    const storage = new LocalObjectStorage(directory)

    await expect(
      storage.upload({
        key: '../outside.mp3',
        buffer: Buffer.from('audio'),
        contentType: 'audio/mpeg',
      }),
    ).rejects.toThrow(/escapes/u)
  })
})
