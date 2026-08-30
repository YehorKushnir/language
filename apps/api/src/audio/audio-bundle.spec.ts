import { describe, expect, it } from 'vitest'

import {
  AUDIO_BUNDLE_VERSION,
  localAudioUrl,
  parseAudioBundleManifest,
  resolveAudioBundlePath,
} from './audio-bundle'

const manifest = {
  version: AUDIO_BUNDLE_VERSION,
  createdAt: '2026-08-30T10:00:00.000Z',
  assets: [
    {
      id: 'asset-1',
      provider: 'google',
      language: 'fi-FI',
      voice: 'fi-FI-Chirp3-HD-Aoede',
      textHash: 'a'.repeat(64),
      sourceText: 'hei',
      speakingRate: null,
      generationVersion: 'v1',
      cacheKey: 'b'.repeat(64),
      storageKey: `audio/fi-FI/voice/${'b'.repeat(64)}.mp3`,
      contentType: 'audio/mpeg',
      durationMs: null,
      checksum: 'c'.repeat(64),
      createdAt: '2026-08-30T10:00:00.000Z',
      updatedAt: '2026-08-30T10:00:00.000Z',
    },
  ],
  lexicalFormLinks: [
    { targetId: 'form-1', audioAssetId: 'asset-1', variant: 'standard' },
  ],
  exerciseLinks: [],
  textLinks: [],
}

describe('audio bundle', () => {
  it('parses a valid manifest and creates its local media URL', () => {
    const parsed = parseAudioBundleManifest(JSON.stringify(manifest))
    expect(parsed.assets).toHaveLength(1)
    expect(localAudioUrl(parsed.assets[0]!.storageKey)).toContain(
      '/api/v1/media/audio/fi-FI/voice/',
    )
  })

  it('rejects unsafe paths and broken references', () => {
    expect(() => resolveAudioBundlePath('/tmp/audio', '../secret')).toThrow(
      /Invalid audio storage key/u,
    )
    expect(() =>
      parseAudioBundleManifest(
        JSON.stringify({
          ...manifest,
          lexicalFormLinks: [
            {
              targetId: 'form-1',
              audioAssetId: 'missing',
              variant: 'standard',
            },
          ],
        }),
      ),
    ).toThrow(/references missing asset/u)
  })

  it('rejects duplicate target variants', () => {
    expect(() =>
      parseAudioBundleManifest(
        JSON.stringify({
          ...manifest,
          lexicalFormLinks: [
            ...manifest.lexicalFormLinks,
            ...manifest.lexicalFormLinks,
          ],
        }),
      ),
    ).toThrow(/Duplicate lexical form audio link/u)
  })
})
