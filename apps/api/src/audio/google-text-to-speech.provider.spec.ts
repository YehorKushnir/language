import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'

import { GoogleTextToSpeechProvider } from './google-text-to-speech.provider'

describe('GoogleTextToSpeechProvider capabilities', () => {
  const provider = new GoogleTextToSpeechProvider(new ConfigService())

  it('uses one canonical server-side asset for Chirp 3 HD', () => {
    expect(
      provider.getCapabilities({
        language: 'fi-FI',
        voice: 'fi-FI-Chirp3-HD-Aoede',
      }),
    ).toEqual({ serverSpeakingRate: false })
  })

  it('allows speaking rate to remain a cache dimension for other voices', () => {
    expect(
      provider.getCapabilities({
        language: 'fi-FI',
        voice: 'fi-FI-Standard-A',
      }),
    ).toEqual({ serverSpeakingRate: true })
  })
})
