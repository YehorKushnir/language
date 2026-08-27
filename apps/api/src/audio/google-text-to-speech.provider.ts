import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import type { TextToSpeechProvider } from './audio.types'

@Injectable()
export class GoogleTextToSpeechProvider implements TextToSpeechProvider {
  readonly name = 'google'
  private client: TextToSpeechClient | undefined
  private gcloudAccessToken: { value: string; refreshAfter: number } | undefined
  private pendingGcloudAccessToken: Promise<string> | undefined
  private nextChirpRequestAt = 0

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  getCapabilities(input: { language: string; voice?: string }) {
    return {
      // Chirp 3 HD has one canonical asset in this product. Listening speed is
      // controlled by HTMLAudioElement.playbackRate instead of another TTS call.
      serverSpeakingRate: !isChirp3HdVoice(input.voice),
    }
  }

  async synthesize(input: {
    text: string
    language: string
    voice?: string
    speakingRate?: number
  }) {
    if (!input.voice) {
      throw new Error('A Google TTS voice must be provided')
    }
    const speakingRate = this.getCapabilities(input).serverSpeakingRate
      ? input.speakingRate
      : undefined
    const request = {
      input: { text: input.text },
      voice: {
        languageCode: input.language,
        name: input.voice,
      },
      audioConfig:
        speakingRate === undefined
          ? { audioEncoding: 'MP3' as const }
          : { audioEncoding: 'MP3' as const, speakingRate },
    }

    if (this.config.get<string>('GOOGLE_TTS_AUTH_MODE', 'adc') === 'gcloud') {
      return this.synthesizeWithGcloud(request)
    }

    await this.waitForQuotaSlot(input.voice)
    const [response] = await this.getClient().synthesizeSpeech(request)
    if (!response.audioContent) {
      throw new Error('Google TTS returned an empty audio response')
    }

    return {
      buffer: Buffer.from(response.audioContent),
      contentType: 'audio/mpeg',
      extension: 'mp3',
    }
  }

  private async synthesizeWithGcloud(request: {
    input: { text: string }
    voice: { languageCode: string; name: string }
    audioConfig: { audioEncoding: 'MP3'; speakingRate?: number }
  }) {
    const projectId = this.config.get<string>('GOOGLE_TTS_PROJECT_ID')?.trim()
    if (!projectId) throw new Error('GOOGLE_TTS_PROJECT_ID is required')
    let accessToken = await this.getGcloudAccessToken()
    let response: Response | undefined
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await this.waitForQuotaSlot(request.voice.name)
      try {
        response = await fetch(
          'https://texttospeech.googleapis.com/v1/text:synthesize',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'x-goog-user-project': projectId,
            },
            body: JSON.stringify(request),
          },
        )
      } catch (error) {
        if (attempt === 5) throw error
        await delay(Math.min(30_000, 2 ** attempt * 2_000))
        continue
      }
      if (response.status === 401 && attempt < 5) {
        this.invalidateGcloudAccessToken(accessToken)
        accessToken = await this.getGcloudAccessToken()
        continue
      }
      if (response.status !== 429 || attempt === 5) break
      await delay(Math.min(30_000, 2 ** attempt * 2_000))
    }
    if (!response?.ok) {
      const detail = response ? (await response.text()).slice(0, 1000) : ''
      throw new Error(
        `Google TTS returned HTTP ${response?.status ?? 'unknown'}: ${detail}`,
      )
    }
    const payload = (await response.json()) as { audioContent?: string }
    if (!payload.audioContent) {
      throw new Error('Google TTS returned an empty audio response')
    }
    return {
      buffer: Buffer.from(payload.audioContent, 'base64'),
      contentType: 'audio/mpeg',
      extension: 'mp3',
    }
  }

  private async getGcloudAccessToken(): Promise<string> {
    if (
      this.gcloudAccessToken &&
      this.gcloudAccessToken.refreshAfter > Date.now()
    ) {
      return this.gcloudAccessToken.value
    }
    this.pendingGcloudAccessToken ??= this.loadGcloudAccessToken().finally(
      () => {
        this.pendingGcloudAccessToken = undefined
      },
    )
    return this.pendingGcloudAccessToken
  }

  private async loadGcloudAccessToken(): Promise<string> {
    const { stdout } = await promisify(execFile)(
      'gcloud',
      ['auth', 'print-access-token'],
      { encoding: 'utf8', maxBuffer: 64 * 1024 },
    )
    const value = stdout.trim()
    if (!value) throw new Error('gcloud returned an empty access token')
    this.gcloudAccessToken = {
      value,
      // Refresh well before the token's server-side validity window closes.
      refreshAfter: Date.now() + 20 * 60 * 1000,
    }
    return value
  }

  private invalidateGcloudAccessToken(value: string): void {
    if (this.gcloudAccessToken?.value === value) {
      this.gcloudAccessToken = undefined
    }
  }

  private async waitForQuotaSlot(voice: string): Promise<void> {
    if (!isChirp3HdVoice(voice)) return
    const minimumInterval = this.config.get<number>(
      'GOOGLE_TTS_CHIRP3_MIN_INTERVAL_MS',
      310,
    )
    const scheduledAt = Math.max(Date.now(), this.nextChirpRequestAt)
    this.nextChirpRequestAt = scheduledAt + minimumInterval
    await delay(scheduledAt - Date.now())
  }

  private getClient(): TextToSpeechClient {
    this.client ??= new TextToSpeechClient({
      projectId: this.config.get<string>('GOOGLE_TTS_PROJECT_ID'),
    })
    return this.client
  }
}

export function isChirp3HdVoice(voice: string | undefined): boolean {
  return /-chirp3-hd-/iu.test(voice ?? '')
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, Math.max(0, milliseconds)),
  )
}
