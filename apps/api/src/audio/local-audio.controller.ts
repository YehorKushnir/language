import {
  Controller,
  Get,
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
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
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
    try {
      const info = await stat(file)
      if (!info.isFile()) throw new NotFoundException()
    } catch {
      throw new NotFoundException()
    }
    response.set({
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': 'audio/mpeg',
    })
    return new StreamableFile(createReadStream(file))
  }
}
