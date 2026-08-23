import type { AccountDataExportResponse } from '@language/contracts'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { CurrentUserId } from '../identity/current-user.decorator'
import { SessionIdentityGuard } from '../identity/session-identity.guard'
import { AccountService } from './account.service'
import { DeleteAccountDto } from './delete-account.dto'

@ApiTags('account')
@UseGuards(SessionIdentityGuard)
@Controller('me')
export class AccountController {
  constructor(private readonly account: AccountService) {}

  @Get('data-export')
  @ApiOperation({ summary: 'Выгрузить персональные данные пользователя' })
  @ApiOkResponse({ description: 'Персональные данные и учебный прогресс' })
  exportData(
    @CurrentUserId() userId: string,
  ): Promise<AccountDataExportResponse> {
    return this.account.exportData(userId)
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Безвозвратно удалить аккаунт и учебные данные' })
  @ApiNoContentResponse({ description: 'Аккаунт удалён' })
  async deleteAccount(
    @CurrentUserId() userId: string,
    @Body() confirmation: DeleteAccountDto,
  ): Promise<void> {
    void confirmation
    await this.account.deleteAccount(userId)
  }
}
