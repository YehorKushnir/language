import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { resolve } from 'node:path'

import {
  AudioBatchGenerationService,
  AudioGenerationService,
} from './audio-generation.service'
import { AudioSettingsService } from './audio-settings.service'
import { AudioService } from './audio.service'
import { AUDIO_OBJECT_STORAGE, TEXT_TO_SPEECH_PROVIDER } from './audio.types'
import { GoogleTextToSpeechProvider } from './google-text-to-speech.provider'
import { LocalAudioController } from './local-audio.controller'
import { LocalObjectStorage, S3ObjectStorage } from './object-storage'

@Global()
@Module({
  controllers: [LocalAudioController],
  providers: [
    AudioSettingsService,
    GoogleTextToSpeechProvider,
    {
      provide: TEXT_TO_SPEECH_PROVIDER,
      inject: [ConfigService, GoogleTextToSpeechProvider],
      useFactory: (
        config: ConfigService,
        google: GoogleTextToSpeechProvider,
      ) => {
        const provider = config.get<string>('TTS_PROVIDER', 'google')
        if (provider !== 'google') {
          throw new Error(`Unsupported TTS_PROVIDER: ${provider}`)
        }
        return google
      },
    },
    {
      provide: AUDIO_OBJECT_STORAGE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const provider = config.get<string>('AUDIO_STORAGE_PROVIDER', 'local')
        if (provider === 'local') {
          return new LocalObjectStorage(
            resolve(config.get<string>('AUDIO_LOCAL_DIRECTORY', '.data')),
          )
        }
        return new S3ObjectStorage(
          required(config, 'AUDIO_STORAGE_BUCKET'),
          optional(config, 'AUDIO_STORAGE_ENDPOINT'),
          required(config, 'AUDIO_STORAGE_ACCESS_KEY'),
          required(config, 'AUDIO_STORAGE_SECRET_KEY'),
          required(config, 'AUDIO_PUBLIC_URL'),
          config.get<string>('AUDIO_STORAGE_REGION', 'auto'),
        )
      },
    },
    AudioService,
    AudioGenerationService,
    AudioBatchGenerationService,
  ],
  exports: [AudioService, AudioGenerationService, AudioBatchGenerationService],
})
export class AudioModule {}

function required(config: ConfigService, key: string): string {
  const value = config.get<string>(key)?.trim()
  if (!value) throw new Error(`${key} is required`)
  return value
}

function optional(config: ConfigService, key: string): string | undefined {
  return config.get<string>(key)?.trim() || undefined
}
