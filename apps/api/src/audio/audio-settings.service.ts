import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AudioSettingsService {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  get provider(): string {
    return this.config.get<string>('TTS_PROVIDER', 'google')
  }

  get language(): string {
    return this.config.get<string>('GOOGLE_TTS_LANGUAGE', 'fi-FI')
  }

  get voice(): string {
    const voice = this.config.get<string>('GOOGLE_TTS_VOICE')?.trim()
    if (!voice) {
      throw new Error('GOOGLE_TTS_VOICE is required to generate audio')
    }
    return voice
  }

  get normalSpeakingRate(): number {
    return this.config.get<number>('AUDIO_NORMAL_SPEAKING_RATE', 1)
  }

  get generationVersion(): string {
    return this.config.get<string>('AUDIO_GENERATION_VERSION', 'v1')
  }

  get batchConcurrency(): number {
    return this.config.get<number>('AUDIO_GENERATION_CONCURRENCY', 4)
  }
}
