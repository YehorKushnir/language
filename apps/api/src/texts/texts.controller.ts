import type {
  PreparedTextCatalogResponse,
  PreparedTextDetailResponse,
} from '@language/contracts'
import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { CurrentUserId } from '../identity/current-user.decorator'
import { SessionIdentityGuard } from '../identity/session-identity.guard'
import { TextsService } from './texts.service'

@ApiTags('texts')
@UseGuards(SessionIdentityGuard)
@Controller('me/texts')
export class TextsController {
  constructor(private readonly texts: TextsService) {}

  @Get(':routeVersionId')
  @ApiOperation({ summary: 'Получить каталог подготовленных текстов' })
  @ApiOkResponse({ description: 'Тексты курса с прогрессом по словам' })
  @ApiNotFoundResponse({ description: 'Версия маршрута не найдена' })
  getCatalog(
    @CurrentUserId() userId: string,
    @Param('routeVersionId') routeVersionId: string,
  ): Promise<PreparedTextCatalogResponse> {
    return this.texts.getCatalog(userId, routeVersionId)
  }

  @Get(':routeVersionId/:textId')
  @ApiOperation({ summary: 'Получить подготовленный текст с разбором слов' })
  @ApiOkResponse({ description: 'Текст, токены и лексический разбор' })
  @ApiNotFoundResponse({ description: 'Маршрут или текст не найден' })
  getText(
    @CurrentUserId() userId: string,
    @Param('routeVersionId') routeVersionId: string,
    @Param('textId') textId: string,
  ): Promise<PreparedTextDetailResponse> {
    return this.texts.getText(userId, routeVersionId, textId)
  }
}
