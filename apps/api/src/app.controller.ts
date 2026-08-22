import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { AppService } from './app.service'

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Получить сведения об API' })
  @ApiOkResponse({
    schema: {
      example: {
        name: 'Language Learning API',
        version: '1',
      },
    },
  })
  getInfo() {
    return this.appService.getInfo()
  }
}
