import { Global, Module } from '@nestjs/common'

import { SessionIdentityGuard } from '../identity/session-identity.guard'
import { AuthService } from './auth.service'
import { PasswordResetMailer } from './password-reset-mailer.service'

@Global()
@Module({
  providers: [PasswordResetMailer, AuthService, SessionIdentityGuard],
  exports: [AuthService, SessionIdentityGuard],
})
export class AuthModule {}
