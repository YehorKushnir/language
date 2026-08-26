import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common'

import { PrismaService } from '../database/prisma.service'
import type { RequestWithCurrentUser } from '../identity/session-identity.guard'

@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithCurrentUser>()
    if (!request.currentUserId) {
      throw new ForbiddenException('Требуются права администратора.')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: request.currentUserId },
      select: { role: true },
    })
    if (user?.role !== 'ADMIN') {
      throw new ForbiddenException('Требуются права администратора.')
    }

    return true
  }
}
