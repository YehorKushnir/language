import {
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Res,
  StreamableFile,
  Inject,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Response } from 'express'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { resolve } from 'node:path'

@Controller('media')
export class LocalAudioController {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  @Get('*path')
  async getAudio(
    @Param('path') path: string | string[],
    @Headers('range') rangeHeader: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile | void> {
    if (
      this.config.get<string>('AUDIO_STORAGE_PROVIDER', 'local') !== 'local'
    ) {
      throw new NotFoundException()
    }
    const key = Array.isArray(path) ? path.join('/') : path
    if (!key.startsWith('audio/')) throw new NotFoundException()
    const root = resolve(
      this.config.get<string>('AUDIO_LOCAL_DIRECTORY', '.data'),
    )
    const file = resolve(root, key)
    if (!file.startsWith(`${root}/`)) throw new NotFoundException()
    let fileSize: number
    try {
      const info = await stat(file)
      if (!info.isFile()) throw new NotFoundException()
      fileSize = info.size
    } catch {
      throw new NotFoundException()
    }
    response.set({
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': 'audio/mpeg',
    })

    if (!rangeHeader) {
      response.set('Content-Length', String(fileSize))
      return new StreamableFile(createReadStream(file))
    }

    const range = parseByteRange(rangeHeader, fileSize)
    if (!range) {
      response.status(416)
      response.set('Content-Range', `bytes */${fileSize}`)
      response.end()
      return
    }

    const contentLength = range.end - range.start + 1
    response.status(206)
    response.set({
      'Content-Length': String(contentLength),
      'Content-Range': `bytes ${range.start}-${range.end}/${fileSize}`,
    })
    return new StreamableFile(
      createReadStream(file, { start: range.start, end: range.end }),
    )
  }
}

export function parseByteRange(
  header: string,
  fileSize: number,
): { start: number; end: number } | null {
  if (!Number.isSafeInteger(fileSize) || fileSize <= 0) return null

  const match = /^bytes=(\d*)-(\d*)$/u.exec(header.trim())
  if (!match) return null
  const [, rawStart = '', rawEnd = ''] = match
  if (!rawStart && !rawEnd) return null

  if (!rawStart) {
    const suffixLength = Number(rawEnd)
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return null
    return {
      start: Math.max(fileSize - suffixLength, 0),
      end: fileSize - 1,
    }
  }

  const start = Number(rawStart)
  const requestedEnd = rawEnd ? Number(rawEnd) : fileSize - 1
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(requestedEnd) ||
    start < 0 ||
    start >= fileSize ||
    requestedEnd < start
  ) {
    return null
  }

  return { start, end: Math.min(requestedEnd, fileSize - 1) }
}
