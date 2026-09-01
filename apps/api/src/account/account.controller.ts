import type {
  AccountAuthMethodsResponse,
  AccountDataExportResponse,
} from '@language/contracts'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import type { Request } from 'express'

import { CurrentUserId } from '../identity/current-user.decorator'
import { SessionIdentityGuard } from '../identity/session-identity.guard'
import { AccountService } from './account.service'
import { DeleteAccountDto } from './delete-account.dto'
import { SetAccountPasswordDto } from './set-account-password.dto'

@ApiTags('account')
@UseGuards(SessionIdentityGuard)
@Controller('me')
export class AccountController {
  constructor(private readonly account: AccountService) {}

  @Get('auth-methods')
  @ApiOperation({ summary: 'Получить подключённые способы входа' })
  @ApiOkResponse({ description: 'Доступные способы входа пользователя' })
  getAuthMethods(
    @CurrentUserId() userId: string,
  ): Promise<AccountAuthMethodsResponse> {
    return this.account.getAuthMethods(userId)
  }

  @Post('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Установить первый пароль для OAuth-аккаунта' })
  @ApiNoContentResponse({ description: 'Пароль установлен' })
  async setPassword(
    @Req() request: Request,
    @Body() input: SetAccountPasswordDto,
  ): Promise<void> {
    await this.account.setPassword(request.headers, input.newPassword)
  }

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
