import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import type { RequestWithCurrentUser } from './session-identity.guard'

export const CurrentUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<RequestWithCurrentUser>()

    if (!request.currentUserId) {
      throw new Error('Current user is missing from the request')
    }

    return request.currentUserId
  },
)
