import type {
  NextReviewResponse,
  ReviewQueueResponse,
} from '@language/contracts'
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { CurrentUserId } from '../identity/current-user.decorator'
import { SessionIdentityGuard } from '../identity/session-identity.guard'
import { ReviewQueueService } from './review-queue.service'

@ApiTags('reviews')
@UseGuards(SessionIdentityGuard)
@Controller('me/reviews')
export class ReviewQueueController {
  constructor(private readonly reviews: ReviewQueueService) {}

  @Get(':routeVersionId/next')
  @ApiOperation({ summary: 'Получить следующее упражнение для повторения' })
  @ApiOkResponse({ description: 'Упражнение по просроченному навыку' })
  @ApiNotFoundResponse({ description: 'Версия маршрута не найдена' })
  getNext(
    @CurrentUserId() userId: string,
    @Param('routeVersionId') routeVersionId: string,
    @Query('sourceLanguage') sourceLanguage = 'ru',
    @Query('exclude') exclude = '',
  ): Promise<NextReviewResponse> {
    const excludedExerciseIds = exclude
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 50)

    return this.reviews.getNext(
      userId,
      routeVersionId,
      sourceLanguage,
      excludedExerciseIds,
    )
  }

  @Get(':routeVersionId')
  @ApiOperation({ summary: 'Получить очередь повторений пользователя' })
  @ApiOkResponse({ description: 'Память знаний в порядке срока повторения' })
  @ApiNotFoundResponse({ description: 'Версия маршрута не найдена' })
  getQueue(
    @CurrentUserId() userId: string,
    @Param('routeVersionId') routeVersionId: string,
  ): Promise<ReviewQueueResponse> {
    return this.reviews.getQueue(userId, routeVersionId)
  }
}
