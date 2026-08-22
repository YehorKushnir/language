import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { fromNodeHeaders } from 'better-auth/node'
import type { Request } from 'express'

import { AuthService } from '../auth/auth.service'

export interface RequestWithCurrentUser extends Request {
  currentUserId?: string
}

@Injectable()
export class SessionIdentityGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithCurrentUser>()
    const session = await this.auth.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    })

    if (!session) {
      throw new UnauthorizedException('Authentication required')
    }

    request.currentUserId = session.user.id
    return true
  }
}
