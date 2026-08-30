import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { resolve } from 'node:path'

export const AUDIO_BUNDLE_VERSION = 1

export interface AudioBundleAsset {
  id: string
  provider: string
  language: string
  voice: string
  textHash: string
  sourceText: string | null
  speakingRate: number | null
  generationVersion: string
  cacheKey: string
  storageKey: string
  contentType: string
  durationMs: number | null
  checksum: string
  createdAt: string
  updatedAt: string
}

export interface AudioBundleLink {
  targetId: string
  audioAssetId: string
  variant: string
}

export interface AudioBundleManifest {
  version: typeof AUDIO_BUNDLE_VERSION
  createdAt: string
  assets: AudioBundleAsset[]
  lexicalFormLinks: AudioBundleLink[]
  exerciseLinks: AudioBundleLink[]
  textLinks: AudioBundleLink[]
}

export function parseAudioBundleManifest(input: string): AudioBundleManifest {
  const value: unknown = JSON.parse(input)
  if (!isRecord(value) || value.version !== AUDIO_BUNDLE_VERSION) {
    throw new Error(`Audio bundle version must be ${AUDIO_BUNDLE_VERSION}`)
  }
  requireString(value, 'createdAt')
  const assets = requireArray(value, 'assets').map(parseAsset)
  const lexicalFormLinks = requireArray(value, 'lexicalFormLinks').map(
    parseLink,
  )
  const exerciseLinks = requireArray(value, 'exerciseLinks').map(parseLink)
  const textLinks = requireArray(value, 'textLinks').map(parseLink)

  requireUnique(
    assets.map(({ id }) => id),
    'audio asset id',
  )
  requireUnique(
    assets.map(({ cacheKey }) => cacheKey),
    'audio cache key',
  )
  requireUnique(
    assets.map(({ storageKey }) => storageKey),
    'audio storage key',
  )
  const assetIds = new Set(assets.map(({ id }) => id))
  for (const link of [...lexicalFormLinks, ...exerciseLinks, ...textLinks]) {
    if (!assetIds.has(link.audioAssetId)) {
      throw new Error(
        `Audio link references missing asset ${link.audioAssetId}`,
      )
    }
  }
  requireUnique(lexicalFormLinks.map(linkIdentity), 'lexical form audio link')
  requireUnique(exerciseLinks.map(linkIdentity), 'exercise audio link')
  requireUnique(textLinks.map(linkIdentity), 'text audio link')

  return {
    version: AUDIO_BUNDLE_VERSION,
    createdAt: String(value.createdAt),
    assets,
    lexicalFormLinks,
    exerciseLinks,
    textLinks,
  }
}

export function resolveAudioBundlePath(rootDirectory: string, key: string) {
  const segments = key.split('/')
  if (
    segments[0] !== 'audio' ||
    segments.length < 2 ||
    segments.some(
      (segment) => !segment || segment === '.' || segment === '..',
    ) ||
    key.includes('\\')
  ) {
    throw new Error(`Invalid audio storage key: ${key}`)
  }
  const root = resolve(rootDirectory)
  const destination = resolve(root, key)
  if (!destination.startsWith(`${root}/`)) {
    throw new Error(`Audio storage key escapes its root: ${key}`)
  }
  return destination
}

export async function sha256File(path: string): Promise<string> {
  const hash = createHash('sha256')
  const stream = createReadStream(path)
  for await (const chunk of stream) hash.update(chunk as Buffer)
  return hash.digest('hex')
}

export function localAudioUrl(storageKey: string): string {
  const encoded = storageKey
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return `/api/v1/media/${encoded}`
}

export async function mapWithConcurrency<T>(
  values: T[],
  concurrency: number,
  action: (value: T) => Promise<void>,
): Promise<void> {
  let nextIndex = 0
  const workers = Array.from(
    { length: Math.min(concurrency, values.length) },
    async () => {
      while (nextIndex < values.length) {
        const index = nextIndex
        nextIndex += 1
        const value = values[index]
        if (value !== undefined) await action(value)
      }
    },
  )
  await Promise.all(workers)
}

function parseAsset(value: unknown): AudioBundleAsset {
  if (!isRecord(value)) throw new Error('Audio bundle asset must be an object')
  const speakingRate = requireNullableNumber(value, 'speakingRate')
  const durationMs = requireNullableNumber(value, 'durationMs')
  const checksum = requireString(value, 'checksum')
  if (!/^[a-f0-9]{64}$/u.test(checksum)) {
    throw new Error(`Invalid audio checksum: ${checksum}`)
  }
  const storageKey = requireString(value, 'storageKey')
  resolveAudioBundlePath('/bundle', storageKey)
  return {
    id: requireString(value, 'id'),
    provider: requireString(value, 'provider'),
    language: requireString(value, 'language'),
    voice: requireString(value, 'voice'),
    textHash: requireString(value, 'textHash'),
    sourceText: requireNullableString(value, 'sourceText'),
    speakingRate,
    generationVersion: requireString(value, 'generationVersion'),
    cacheKey: requireString(value, 'cacheKey'),
    storageKey,
    contentType: requireString(value, 'contentType'),
    durationMs,
    checksum,
    createdAt: requireString(value, 'createdAt'),
    updatedAt: requireString(value, 'updatedAt'),
  }
}

function parseLink(value: unknown): AudioBundleLink {
  if (!isRecord(value)) throw new Error('Audio bundle link must be an object')
  return {
    targetId: requireString(value, 'targetId'),
    audioAssetId: requireString(value, 'audioAssetId'),
    variant: requireString(value, 'variant'),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requireArray(value: Record<string, unknown>, key: string): unknown[] {
  const result = value[key]
  if (!Array.isArray(result)) throw new Error(`${key} must be an array`)
  return result
}

function requireString(value: Record<string, unknown>, key: string): string {
  const result = value[key]
  if (typeof result !== 'string' || !result) {
    throw new Error(`${key} must be a non-empty string`)
  }
  return result
}

function requireNullableString(
  value: Record<string, unknown>,
  key: string,
): string | null {
  const result = value[key]
  if (result !== null && typeof result !== 'string') {
    throw new Error(`${key} must be a string or null`)
  }
  return result
}

function requireNullableNumber(
  value: Record<string, unknown>,
  key: string,
): number | null {
  const result = value[key]
  if (
    result !== null &&
    (typeof result !== 'number' || !Number.isFinite(result))
  ) {
    throw new Error(`${key} must be a finite number or null`)
  }
  return result
}

function requireUnique(values: string[], label: string): void {
  const seen = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) throw new Error(`Duplicate ${label}: ${value}`)
    seen.add(value)
  }
}

function linkIdentity(link: AudioBundleLink): string {
  return `${link.targetId}\0${link.variant}`
}
