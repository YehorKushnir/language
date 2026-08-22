import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Проверить доступность API' })
  @ApiOkResponse({ schema: { example: { status: 'ok' } } })
  getHealth() {
    return { status: 'ok' } as const
  }
}
