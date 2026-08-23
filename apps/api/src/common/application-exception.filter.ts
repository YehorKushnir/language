import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { Request, Response } from 'express'

import type { RequestWithId } from './request-logging.interceptor'

const databaseUnavailableCodes = new Set(['P1000', 'P1001', 'P1002'])
const databaseNotReadyCodes = new Set(['P1003', 'P2021', 'P2022'])

@Catch()
export class ApplicationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApplicationExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp()
    const request = http.getRequest<Request & RequestWithId>()
    const response = http.getResponse<Response>()
    const prismaCode = getPrismaErrorCode(exception)
    const requestId = request.requestId

    if (prismaCode && databaseUnavailableCodes.has(prismaCode)) {
      this.logger.warn(
        `${request.method} ${request.url}: database unavailable (${prismaCode})`,
      )
      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        code: 'DATABASE_UNAVAILABLE',
        message:
          'База данных недоступна. Для локального запуска выполните pnpm dev:setup.',
        requestId,
      })
      return
    }

    if (prismaCode && databaseNotReadyCodes.has(prismaCode)) {
      this.logger.warn(
        `${request.method} ${request.url}: database is not ready (${prismaCode})`,
      )
      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        code: 'DATABASE_NOT_READY',
        message:
          'База данных не подготовлена. Выполните миграции и seed командой pnpm dev:setup.',
        requestId,
      })
      return
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const payload = exception.getResponse()
      const body =
        typeof payload === 'string'
          ? { statusCode: status, message: payload }
          : payload
      response
        .status(status)
        .json(
          typeof body === 'object' && body !== null
            ? { ...body, requestId }
            : { statusCode: status, message: body, requestId },
        )
      return
    }

    this.logger.error(
      `${request.method} ${request.url}: unhandled exception`,
      exception instanceof Error ? exception.stack : String(exception),
    )
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      requestId,
    })
  }
}

export function getPrismaErrorCode(exception: unknown): string | null {
  if (!exception || typeof exception !== 'object') {
    return null
  }

  const candidate = exception as { code?: unknown; errorCode?: unknown }
  if (typeof candidate.code === 'string') {
    return candidate.code
  }

  return typeof candidate.errorCode === 'string' ? candidate.errorCode : null
}
