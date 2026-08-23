import type { HealthResponse } from '@language/contracts'
import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common'
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger'

import { PrismaService } from './database/prisma.service'
import { FinnishMorphologyService } from './morphology/finnish-morphology.service'

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(FinnishMorphologyService)
    private readonly morphology: FinnishMorphologyService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Проверить готовность API и базы данных' })
  @ApiOkResponse({
    schema: {
      example: { status: 'ok', database: 'ok', morphology: 'ok' },
    },
  })
  @ApiServiceUnavailableResponse({ description: 'PostgreSQL недоступна' })
  async getHealth(): Promise<HealthResponse> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
    } catch {
      throw new ServiceUnavailableException({
        statusCode: 503,
        code: 'DATABASE_UNAVAILABLE',
        message:
          'База данных недоступна. Для локального запуска выполните pnpm dev:setup.',
      })
    }

    try {
      await this.morphology.getInfo()
    } catch {
      throw new ServiceUnavailableException({
        statusCode: 503,
        code: 'MORPHOLOGY_UNAVAILABLE',
        message: 'Морфологический анализатор финского языка недоступен.',
      })
    }

    return { status: 'ok', database: 'ok', morphology: 'ok' }
  }
}
