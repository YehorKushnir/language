import { randomUUID } from 'node:crypto'

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import type { Observable } from 'rxjs'
import { finalize } from 'rxjs/operators'

export interface RequestWithId extends Request {
  requestId?: string
}

const validRequestId = /^[A-Za-z0-9._:-]{1,100}$/u

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp()
    const request = http.getRequest<RequestWithId>()
    const response = http.getResponse<Response>()
    const supplied = request.header('x-request-id')
    const requestId =
      supplied && validRequestId.test(supplied) ? supplied : randomUUID()
    const startedAt = Date.now()

    request.requestId = requestId
    response.setHeader('x-request-id', requestId)

    return next.handle().pipe(
      finalize(() => {
        this.logger.log(
          JSON.stringify({
            requestId,
            method: request.method,
            path: request.originalUrl,
            statusCode: response.statusCode,
            durationMs: Date.now() - startedAt,
          }),
        )
      }),
    )
  }
}
