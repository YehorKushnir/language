import type {
  UserVocabularyResponse,
  VocabularyStudyResponse,
} from '@language/contracts'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common'
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { CurrentUserId } from '../identity/current-user.decorator'
import { SessionIdentityGuard } from '../identity/session-identity.guard'
import { VocabularyStudyDto } from '../progress/vocabulary-study.dto'
import { VocabularyService } from './vocabulary.service'

@ApiTags('vocabulary')
@UseGuards(SessionIdentityGuard)
@Controller('me/vocabulary')
export class VocabularyController {
  constructor(private readonly vocabulary: VocabularyService) {}

  @Get(':routeVersionId')
  @ApiOperation({ summary: 'Получить слова и грамматику пользователя' })
  @ApiOkResponse({ description: 'Слова, навыки и их состояния памяти' })
  @ApiNotFoundResponse({ description: 'Версия маршрута не найдена' })
  getUserVocabulary(
    @CurrentUserId() userId: string,
    @Param('routeVersionId') routeVersionId: string,
  ): Promise<UserVocabularyResponse> {
    return this.vocabulary.getUserVocabulary(userId, routeVersionId)
  }

  @Put(':routeVersionId/:itemId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Добавить значение слова в очередь изучения' })
  @ApiOkResponse({ description: 'Новое или существующее состояние памяти' })
  addToLearning(
    @CurrentUserId() userId: string,
    @Param('routeVersionId') routeVersionId: string,
    @Param('itemId') itemId: string,
  ): Promise<VocabularyStudyResponse> {
    return this.vocabulary.addToLearning(userId, routeVersionId, itemId)
  }

  @Put(':routeVersionId/:itemId/review')
  @HttpCode(200)
  @ApiOperation({ summary: 'Оценить карточку слова при повторении' })
  @ApiOkResponse({ description: 'Обновлённое состояние памяти слова' })
  reviewItem(
    @CurrentUserId() userId: string,
    @Param('routeVersionId') routeVersionId: string,
    @Param('itemId') itemId: string,
    @Body() study: VocabularyStudyDto,
  ): Promise<VocabularyStudyResponse> {
    return this.vocabulary.reviewItem(
      userId,
      routeVersionId,
      itemId,
      study.result,
    )
  }
}
