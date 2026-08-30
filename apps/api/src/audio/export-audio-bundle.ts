import { DatabaseClient } from '@language/database'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import {
  AUDIO_BUNDLE_VERSION,
  type AudioBundleManifest,
  mapWithConcurrency,
  parseAudioBundleManifest,
  resolveAudioBundlePath,
  sha256File,
} from './audio-bundle'

async function main() {
  const options = parseOptions(process.argv.slice(2))
  const database = new DatabaseClient()
  try {
    const rows = await database.audioAsset.findMany({
      orderBy: { cacheKey: 'asc' },
      include: {
        lexicalForms: {
          orderBy: [{ lexicalFormId: 'asc' }, { variant: 'asc' }],
        },
        exercises: {
          orderBy: [{ exerciseId: 'asc' }, { variant: 'asc' }],
        },
        texts: { orderBy: [{ textId: 'asc' }, { variant: 'asc' }] },
      },
    })
    if (rows.length === 0) throw new Error('No AudioAsset rows were found')

    const manifest: AudioBundleManifest = {
      version: AUDIO_BUNDLE_VERSION,
      createdAt: new Date().toISOString(),
      assets: rows.map((asset) => ({
        id: asset.id,
        provider: asset.provider,
        language: asset.language,
        voice: asset.voice,
        textHash: asset.textHash,
        sourceText: asset.sourceText,
        speakingRate: asset.speakingRate,
        generationVersion: asset.generationVersion,
        cacheKey: asset.cacheKey,
        storageKey: asset.storageKey,
        contentType: asset.contentType,
        durationMs: asset.durationMs,
        checksum: asset.checksum,
        createdAt: asset.createdAt.toISOString(),
        updatedAt: asset.updatedAt.toISOString(),
      })),
      lexicalFormLinks: rows.flatMap((asset) =>
        asset.lexicalForms.map((link) => ({
          targetId: link.lexicalFormId,
          audioAssetId: asset.id,
          variant: link.variant,
        })),
      ),
      exerciseLinks: rows.flatMap((asset) =>
        asset.exercises.map((link) => ({
          targetId: link.exerciseId,
          audioAssetId: asset.id,
          variant: link.variant,
        })),
      ),
      textLinks: rows.flatMap((asset) =>
        asset.texts.map((link) => ({
          targetId: link.textId,
          audioAssetId: asset.id,
          variant: link.variant,
        })),
      ),
    }

    await mapWithConcurrency(manifest.assets, 32, async (asset) => {
      const path = resolveAudioBundlePath(
        options.audioDirectory,
        asset.storageKey,
      )
      const checksum = await sha256File(path)
      if (checksum !== asset.checksum) {
        throw new Error(`Checksum mismatch for ${asset.storageKey}`)
      }
    })

    const serialized = `${JSON.stringify(manifest)}\n`
    parseAudioBundleManifest(serialized)
    await mkdir(dirname(options.output), { recursive: true })
    await writeFile(options.output, serialized, { mode: 0o600 })
    process.stdout.write(
      `Audio bundle manifest exported: ${manifest.assets.length} assets, ` +
        `${manifest.lexicalFormLinks.length} lexical links, ` +
        `${manifest.exerciseLinks.length} exercise links, ` +
        `${manifest.textLinks.length} text links\n`,
    )
  } finally {
    await database.$disconnect()
  }
}

function parseOptions(arguments_: string[]) {
  const values = normalizeOptions(arguments_)
  const output = values.get('output')
  const audioDirectory = values.get('audio-directory')
  if (!output) throw new Error('--output is required')
  if (!audioDirectory) throw new Error('--audio-directory is required')
  return { output: resolve(output), audioDirectory: resolve(audioDirectory) }
}

function normalizeOptions(arguments_: string[]): Map<string, string> {
  const values = new Map<string, string>()
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index]
    if (!argument || argument === '--') continue
    const match = /^--([^=]+)=(.+)$/u.exec(argument)
    if (match?.[1] && match[2]) {
      values.set(match[1], match[2])
      continue
    }
    if (argument.startsWith('--')) {
      const value = arguments_[index + 1]
      if (!value) throw new Error(`${argument} requires a value`)
      values.set(argument.slice(2), value)
      index += 1
      continue
    }
    throw new Error(`Unknown export option: ${argument}`)
  }
  return values
}

void main().catch((error: unknown) => {
  process.stderr.write(
    `Audio bundle export failed: ${error instanceof Error ? error.stack : String(error)}\n`,
  )
  process.exitCode = 1
})
