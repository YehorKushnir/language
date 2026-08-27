export interface TextToSpeechProvider {
  readonly name: string

  getCapabilities(input: {
    language: string
    voice?: string
  }): TextToSpeechCapabilities

  synthesize(input: {
    text: string
    language: string
    voice?: string
    speakingRate?: number
  }): Promise<{
    buffer: Buffer
    contentType: string
    extension: string
  }>
}

export interface TextToSpeechCapabilities {
  /** Whether this adapter applies speakingRate during server-side synthesis. */
  serverSpeakingRate: boolean
}

export interface ObjectStorage {
  upload(input: {
    key: string
    buffer: Buffer
    contentType: string
  }): Promise<void>
  delete(key: string): Promise<void>
  getPublicUrl(key: string): string
}

export const TEXT_TO_SPEECH_PROVIDER = Symbol('TEXT_TO_SPEECH_PROVIDER')
export const AUDIO_OBJECT_STORAGE = Symbol('AUDIO_OBJECT_STORAGE')

export interface AudioAssetResult {
  id: string
  cacheKey: string
  storageKey: string
  url: string
  contentType: string
  cached: boolean
}
