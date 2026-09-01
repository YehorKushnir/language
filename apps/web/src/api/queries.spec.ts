import { QueryClient } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { textAudioFileQuery } from './queries'

describe('text audio query', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('downloads the complete file once and reuses the cached blob', async () => {
    const audio = new Blob(['complete audio'], { type: 'audio/mpeg' })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(audio),
    })
    vi.stubGlobal('fetch', fetchMock)
    const queryClient = new QueryClient()
    const query = textAudioFileQuery('/api/v1/media/audio/text.mp3')

    const [first, second] = await Promise.all([
      queryClient.fetchQuery(query),
      queryClient.fetchQuery(query),
    ])
    const cached = await queryClient.fetchQuery(query)

    expect(first).toBe(audio)
    expect(second).toBe(audio)
    expect(cached).toBe(audio)
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/media/audio/text.mp3', {
      credentials: 'include',
    })
  })
})
