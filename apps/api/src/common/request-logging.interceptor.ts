import { randomUUID } from 'node:crypto'

import { Logger } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'

export interface RequestWithId extends Request {
  requestId?: string
}

const validRequestId = /^[A-Za-z0-9._:-]{1,100}$/u
const logger = new Logger('HTTP')

export function requestContextMiddleware(
  request: RequestWithId,
  response: Response,
  next: NextFunction,
) {
  const supplied = request.header('x-request-id')
  const requestId =
    supplied && validRequestId.test(supplied) ? supplied : randomUUID()
  const startedAt = Date.now()

  request.requestId = requestId
  response.setHeader('x-request-id', requestId)
  response.once('finish', () => {
    logger.log(
      JSON.stringify({
        requestId,
        method: request.method,
        path: request.originalUrl,
        statusCode: response.statusCode,
        durationMs: Date.now() - startedAt,
      }),
    )
  })
  next()
}
