import type {
  CourseProgressResponse,
  LessonVocabularyAnswerResponse,
  LessonVocabularyStudySessionResponse,
  LessonPart,
  PracticeCompletionResponse,
  PracticeSessionResponse,
} from '@language/contracts'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseEnumPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { CurrentUserId } from '../identity/current-user.decorator'
import { SessionIdentityGuard } from '../identity/session-identity.guard'
import { CourseProgressService } from './course-progress.service'
import { VocabularyAnswerDto } from './vocabulary-answer.dto'

enum LessonPartParam {
  Explanation = 'explanation',
  Vocabulary = 'vocabulary',
}

@ApiTags('progress')
@UseGuards(SessionIdentityGuard)
@Controller('me/course-progress')
export class CourseProgressController {
  constructor(private readonly courseProgress: CourseProgressService) {}

  @Get(':routeVersionId')
  @ApiOperation({ summary: 'Получить прогресс текущего пользователя' })
  @ApiOkResponse({ description: 'Прогресс по маршруту курса' })
  getProgress(
    @CurrentUserId() userId: string,
    @Param('routeVersionId') routeVersionId: string,
  ): Promise<CourseProgressResponse> {
    return this.courseProgress.getProgress(userId, routeVersionId)
  }

  @Put(':routeVersionId/lessons/:lessonId/parts/:part')
  @HttpCode(200)
  @ApiOperation({ summary: 'Отметить часть урока завершённой' })
  @ApiOkResponse({ description: 'Обновлённый прогресс по маршруту' })
  completePart(
    @CurrentUserId() userId: string,
    @Param('routeVersionId') routeVersionId: string,
    @Param('lessonId') lessonId: string,
    @Param('part', new ParseEnumPipe(LessonPartParam)) part: LessonPartParam,
  ): Promise<CourseProgressResponse> {
    return this.courseProgress.completePart(
      userId,
      routeVersionId,
      lessonId,
      part as LessonPart,
    )
  }

  @Put(':routeVersionId/lessons/:lessonId/practice-session')
  @HttpCode(200)
  @ApiOperation({ summary: 'Начать или продолжить практику урока' })
  @ApiOkResponse({
    description: 'Сохранённое состояние текущей практики',
  })
  startOrResumePractice(
    @CurrentUserId() userId: string,
    @Param('routeVersionId') routeVersionId: string,
    @Param('lessonId') lessonId: string,
  ): Promise<PracticeSessionResponse> {
    return this.courseProgress.startOrResumePractice(
      userId,
      routeVersionId,
      lessonId,
    )
  }

  @Post(':routeVersionId/lessons/:lessonId/practice-completion')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Проверить результат полной практики и завершить её',
  })
  @ApiOkResponse({
    description: 'Результат сессии из 60 уникальных упражнений',
  })
  completePractice(
    @CurrentUserId() userId: string,
    @Param('routeVersionId') routeVersionId: string,
    @Param('lessonId') lessonId: string,
  ): Promise<PracticeCompletionResponse> {
    return this.courseProgress.completePractice(
      userId,
      routeVersionId,
      lessonId,
    )
  }

  @Put(':routeVersionId/lessons/:lessonId/vocabulary-session')
  @HttpCode(200)
  @ApiOperation({ summary: 'Начать или продолжить изучение слов урока' })
  @ApiOkResponse({ description: 'Сохранённый прогресс активного вспоминания' })
  startOrResumeVocabulary(
    @CurrentUserId() userId: string,
    @Param('routeVersionId') routeVersionId: string,
    @Param('lessonId') lessonId: string,
  ): Promise<LessonVocabularyStudySessionResponse> {
    return this.courseProgress.startOrResumeVocabulary(
      userId,
      routeVersionId,
      lessonId,
    )
  }

  @Post(':routeVersionId/lessons/:lessonId/vocabulary/:itemId/attempts')
  @HttpCode(200)
  @ApiOperation({ summary: 'Проверить активный ответ на слово урока' })
  @ApiOkResponse({ description: 'Результат и сохранённый прогресс слова' })
  submitVocabularyAnswer(
    @CurrentUserId() userId: string,
    @Param('routeVersionId') routeVersionId: string,
    @Param('lessonId') lessonId: string,
    @Param('itemId') itemId: string,
    @Body() body: VocabularyAnswerDto,
  ): Promise<LessonVocabularyAnswerResponse> {
    return this.courseProgress.submitVocabularyAnswer(
      userId,
      routeVersionId,
      lessonId,
      itemId,
      body.answer,
      body.idempotencyKey,
      body.gaveUp ?? false,
    )
  }
}
