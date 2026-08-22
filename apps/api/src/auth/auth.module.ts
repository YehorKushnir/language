import { Global, Module } from '@nestjs/common'

import { SessionIdentityGuard } from '../identity/session-identity.guard'
import { AuthService } from './auth.service'

@Global()
@Module({
  providers: [AuthService, SessionIdentityGuard],
  exports: [AuthService, SessionIdentityGuard],
})
export class AuthModule {}
