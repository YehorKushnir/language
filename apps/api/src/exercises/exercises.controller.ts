import type {
  ExerciseAttemptResponse,
  PreparedExerciseResponse,
} from '@language/contracts'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
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
import { ExerciseAttemptDto } from './exercise-attempt.dto'
import { ExercisesService } from './exercises.service'

@ApiTags('exercises')
@UseGuards(SessionIdentityGuard)
@Controller()
export class ExercisesController {
  constructor(private readonly exercises: ExercisesService) {}

  @Get('lessons/:lessonId/exercises/next')
  @ApiOperation({ summary: 'Получить следующее упражнение урока' })
  @ApiOkResponse({ description: 'Задание без эталонного ответа' })
  @ApiNotFoundResponse({ description: 'Подходящее упражнение не найдено' })
  getNextExercise(
    @CurrentUserId() userId: string,
    @Param('lessonId') lessonId: string,
    @Query('sourceLanguage') sourceLanguage = 'ru',
    @Query('exclude') exclude = '',
  ): Promise<PreparedExerciseResponse> {
    const excludedExerciseIds = exclude
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 20)

    return this.exercises.getNextExercise(
      userId,
      lessonId,
      sourceLanguage,
      excludedExerciseIds,
    )
  }

  @Post('exercises/:exerciseId/attempts')
  @HttpCode(200)
  @ApiOperation({ summary: 'Проверить и сохранить ответ пользователя' })
  @ApiOkResponse({ description: 'Результат точной проверки ответа' })
  @ApiNotFoundResponse({ description: 'Упражнение не найдено' })
  submitAttempt(
    @CurrentUserId() userId: string,
    @Param('exerciseId') exerciseId: string,
    @Body() attempt: ExerciseAttemptDto,
  ): Promise<ExerciseAttemptResponse> {
    return this.exercises.submitAttempt(userId, exerciseId, attempt)
  }
}
