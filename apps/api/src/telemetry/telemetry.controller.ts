import {
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
  Req,
  ValidationPipe,
} from '@nestjs/common'

import type { RequestWithId } from '../common/request-logging.interceptor'
import { ClientErrorDto } from './client-error.dto'

@Controller('telemetry')
export class TelemetryController {
  private readonly logger = new Logger('ClientTelemetry')

  @Post('client-errors')
  @HttpCode(204)
  reportClientError(
    @Body(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    )
    error: ClientErrorDto,
    @Req() request: RequestWithId,
  ): void {
    this.logger.warn(
      JSON.stringify({
        event: 'client_error',
        requestId: request.requestId,
        type: error.type,
        message: error.message,
        path: error.path,
        stack: error.stack,
        userAgent: request.header('user-agent')?.slice(0, 300),
      }),
    )
  }
}
