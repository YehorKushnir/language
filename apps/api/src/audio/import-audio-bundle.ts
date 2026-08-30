import { DatabaseClient, type Prisma } from '@language/database'
import { constants } from 'node:fs'
import { copyFile, mkdir, readFile, rename, rm, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import {
  type AudioBundleAsset,
  type AudioBundleLink,
  localAudioUrl,
  mapWithConcurrency,
  parseAudioBundleManifest,
  resolveAudioBundlePath,
  sha256File,
} from './audio-bundle'

const DATABASE_BATCH_SIZE = 500

async function main() {
  const options = parseOptions(process.argv.slice(2))
  const manifest = parseAudioBundleManifest(
    await readFile(options.manifest, 'utf8'),
  )
  const database = new DatabaseClient()
  try {
    await validateSourceFiles(manifest.assets, options.sourceDirectory)
    await validateTargets(database, manifest)
    await validateExistingAssets(database, manifest.assets)
    if (options.dryRun) {
      process.stdout.write(
        `Audio bundle dry run passed: ${manifest.assets.length} assets and ` +
          `${linkCount(manifest)} links\n`,
      )
      return
    }

    const copied = await copyAudioFiles(
      manifest.assets,
      options.sourceDirectory,
      options.audioDirectory,
    )
    await importMetadata(database, manifest)
    process.stdout.write(
      `Audio bundle imported: ${manifest.assets.length} assets, ` +
        `${linkCount(manifest)} links, ${copied} new files\n`,
    )
  } finally {
    await database.$disconnect()
  }
}

async function validateSourceFiles(
  assets: AudioBundleAsset[],
  sourceDirectory: string,
): Promise<void> {
  await mapWithConcurrency(assets, 32, async (asset) => {
    const source = resolveAudioBundlePath(sourceDirectory, asset.storageKey)
    const sourceStat = await stat(source)
    if (!sourceStat.isFile()) {
      throw new Error(`Bundle entry is not a regular file: ${asset.storageKey}`)
    }
    if ((await sha256File(source)) !== asset.checksum) {
      throw new Error(`Bundle checksum mismatch: ${asset.storageKey}`)
    }
  })
}

async function validateTargets(
  database: DatabaseClient,
  manifest: ReturnType<typeof parseAudioBundleManifest>,
): Promise<void> {
  await assertTargetsExist(
    manifest.lexicalFormLinks.map(({ targetId }) => targetId),
    async (ids) =>
      database.lexicalForm.findMany({
        where: { id: { in: ids } },
        select: { id: true },
      }),
    'lexical forms',
  )
  await assertTargetsExist(
    manifest.exerciseLinks.map(({ targetId }) => targetId),
    async (ids) =>
      database.exercise.findMany({
        where: { id: { in: ids } },
        select: { id: true },
      }),
    'exercises',
  )
  await assertTargetsExist(
    manifest.textLinks.map(({ targetId }) => targetId),
    async (ids) =>
      database.text.findMany({
        where: { id: { in: ids } },
        select: { id: true },
      }),
    'texts',
  )
}

async function assertTargetsExist(
  inputIds: string[],
  load: (ids: string[]) => Promise<Array<{ id: string }>>,
  label: string,
): Promise<void> {
  const ids = [...new Set(inputIds)]
  const existing = new Set<string>()
  for (const batch of chunk(ids, DATABASE_BATCH_SIZE)) {
    for (const row of await load(batch)) existing.add(row.id)
  }
  const missing = ids.filter((id) => !existing.has(id))
  if (missing.length > 0) {
    throw new Error(
      `Bundle references ${missing.length} missing ${label}: ${missing.slice(0, 10).join(', ')}`,
    )
  }
}

async function validateExistingAssets(
  database: DatabaseClient,
  assets: AudioBundleAsset[],
): Promise<void> {
  for (const batch of chunk(assets, DATABASE_BATCH_SIZE)) {
    const existing = await database.audioAsset.findMany({
      where: { cacheKey: { in: batch.map(({ cacheKey }) => cacheKey) } },
      select: { cacheKey: true, storageKey: true, checksum: true },
    })
    const expected = new Map(batch.map((asset) => [asset.cacheKey, asset]))
    for (const row of existing) {
      const asset = expected.get(row.cacheKey)
      if (
        !asset ||
        asset.storageKey !== row.storageKey ||
        asset.checksum !== row.checksum
      ) {
        throw new Error(`Existing AudioAsset conflicts with ${row.cacheKey}`)
      }
    }
  }
}

async function copyAudioFiles(
  assets: AudioBundleAsset[],
  sourceDirectory: string,
  audioDirectory: string,
): Promise<number> {
  let copied = 0
  await mapWithConcurrency(assets, 16, async (asset) => {
    const source = resolveAudioBundlePath(sourceDirectory, asset.storageKey)
    const destination = resolveAudioBundlePath(audioDirectory, asset.storageKey)
    try {
      const destinationStat = await stat(destination)
      if (!destinationStat.isFile()) {
        throw new Error(`Audio destination is not a file: ${asset.storageKey}`)
      }
      if ((await sha256File(destination)) !== asset.checksum) {
        throw new Error(
          `Existing audio file has another checksum: ${asset.storageKey}`,
        )
      }
      return
    } catch (error) {
      if (!isMissingFile(error)) throw error
    }

    await mkdir(dirname(destination), { recursive: true })
    const temporary = `${destination}.import-${process.pid}-${Date.now()}`
    try {
      await copyFile(source, temporary, constants.COPYFILE_EXCL)
      await rename(temporary, destination)
      copied += 1
    } finally {
      await rm(temporary, { force: true })
    }
  })
  return copied
}

async function importMetadata(
  database: DatabaseClient,
  manifest: ReturnType<typeof parseAudioBundleManifest>,
): Promise<void> {
  await database.$transaction(
    async (transaction) => {
      for (const batch of chunk(manifest.assets, DATABASE_BATCH_SIZE)) {
        await transaction.audioAsset.createMany({
          data: batch.map(toAudioAssetCreateInput),
          skipDuplicates: true,
        })
      }

      const assetIds = new Map<string, string>()
      for (const batch of chunk(manifest.assets, DATABASE_BATCH_SIZE)) {
        const rows = await transaction.audioAsset.findMany({
          where: { cacheKey: { in: batch.map(({ cacheKey }) => cacheKey) } },
          select: { id: true, cacheKey: true },
        })
        for (const row of rows) assetIds.set(row.cacheKey, row.id)
      }
      if (assetIds.size !== manifest.assets.length) {
        throw new Error('Not every bundled AudioAsset could be persisted')
      }
      const cacheKeyBySourceId = new Map(
        manifest.assets.map(({ id, cacheKey }) => [id, cacheKey]),
      )
      const resolveAssetId = (sourceId: string) => {
        const cacheKey = cacheKeyBySourceId.get(sourceId)
        const id = cacheKey ? assetIds.get(cacheKey) : undefined
        if (!id) throw new Error(`Could not resolve imported asset ${sourceId}`)
        return id
      }

      await replaceLexicalLinks(
        transaction,
        manifest.lexicalFormLinks,
        resolveAssetId,
      )
      await replaceExerciseLinks(
        transaction,
        manifest.exerciseLinks,
        resolveAssetId,
      )
      await replaceTextLinks(transaction, manifest.textLinks, resolveAssetId)
    },
    { maxWait: 60_000, timeout: 300_000 },
  )
}

function toAudioAssetCreateInput(
  asset: AudioBundleAsset,
): Prisma.AudioAssetCreateManyInput {
  return {
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
    url: localAudioUrl(asset.storageKey),
    contentType: asset.contentType,
    durationMs: asset.durationMs,
    checksum: asset.checksum,
    createdAt: new Date(asset.createdAt),
    updatedAt: new Date(asset.updatedAt),
  }
}

async function replaceLexicalLinks(
  transaction: Prisma.TransactionClient,
  links: AudioBundleLink[],
  resolveAssetId: (sourceId: string) => string,
) {
  for (const batch of chunk(
    [...new Set(links.map(({ targetId }) => targetId))],
    DATABASE_BATCH_SIZE,
  )) {
    await transaction.lexicalFormAudioAsset.deleteMany({
      where: { lexicalFormId: { in: batch } },
    })
  }
  for (const batch of chunk(links, DATABASE_BATCH_SIZE)) {
    await transaction.lexicalFormAudioAsset.createMany({
      data: batch.map((link) => ({
        lexicalFormId: link.targetId,
        audioAssetId: resolveAssetId(link.audioAssetId),
        variant: link.variant,
      })),
      skipDuplicates: true,
    })
  }
}

async function replaceExerciseLinks(
  transaction: Prisma.TransactionClient,
  links: AudioBundleLink[],
  resolveAssetId: (sourceId: string) => string,
) {
  for (const batch of chunk(
    [...new Set(links.map(({ targetId }) => targetId))],
    DATABASE_BATCH_SIZE,
  )) {
    await transaction.exerciseAudioAsset.deleteMany({
      where: { exerciseId: { in: batch } },
    })
  }
  for (const batch of chunk(links, DATABASE_BATCH_SIZE)) {
    await transaction.exerciseAudioAsset.createMany({
      data: batch.map((link) => ({
        exerciseId: link.targetId,
        audioAssetId: resolveAssetId(link.audioAssetId),
        variant: link.variant,
      })),
      skipDuplicates: true,
    })
  }
}

async function replaceTextLinks(
  transaction: Prisma.TransactionClient,
  links: AudioBundleLink[],
  resolveAssetId: (sourceId: string) => string,
) {
  for (const batch of chunk(
    [...new Set(links.map(({ targetId }) => targetId))],
    DATABASE_BATCH_SIZE,
  )) {
    await transaction.textAudioAsset.deleteMany({
      where: { textId: { in: batch } },
    })
  }
  for (const batch of chunk(links, DATABASE_BATCH_SIZE)) {
    await transaction.textAudioAsset.createMany({
      data: batch.map((link) => ({
        textId: link.targetId,
        audioAssetId: resolveAssetId(link.audioAssetId),
        variant: link.variant,
      })),
      skipDuplicates: true,
    })
  }
}

function parseOptions(arguments_: string[]) {
  const values = new Map<string, string>()
  let dryRun = false
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index]
    if (!argument || argument === '--') continue
    if (argument === '--dry-run') {
      dryRun = true
      continue
    }
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
    throw new Error(`Unknown import option: ${argument}`)
  }
  return {
    manifest: resolve(values.get('manifest') ?? '/import/audio-manifest.json'),
    sourceDirectory: resolve(values.get('source-directory') ?? '/import'),
    audioDirectory: resolve(
      values.get('audio-directory') ??
        process.env.AUDIO_LOCAL_DIRECTORY ??
        '.data',
    ),
    dryRun,
  }
}

function chunk<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size))
  }
  return chunks
}

function linkCount(manifest: ReturnType<typeof parseAudioBundleManifest>) {
  return (
    manifest.lexicalFormLinks.length +
    manifest.exerciseLinks.length +
    manifest.textLinks.length
  )
}

function isMissingFile(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ENOENT'
  )
}

void main().catch((error: unknown) => {
  process.stderr.write(
    `Audio bundle import failed: ${error instanceof Error ? error.stack : String(error)}\n`,
  )
  process.exitCode = 1
})
