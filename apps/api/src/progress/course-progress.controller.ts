import type {
  CourseProgressResponse,
  LessonPart,
  PracticeCompletionResponse,
  VocabularyStudyResponse,
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
import { PracticeCompletionDto } from './practice-completion.dto'
import { VocabularyStudyDto } from './vocabulary-study.dto'

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
    @Body() body: PracticeCompletionDto,
  ): Promise<PracticeCompletionResponse> {
    return this.courseProgress.completePractice(
      userId,
      routeVersionId,
      lessonId,
      body.attemptIds,
    )
  }

  @Put(':routeVersionId/lessons/:lessonId/vocabulary/:itemId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Оценить слово и запланировать повторение' })
  @ApiOkResponse({ description: 'Обновлённое состояние памяти слова' })
  studyVocabularyItem(
    @CurrentUserId() userId: string,
    @Param('routeVersionId') routeVersionId: string,
    @Param('lessonId') lessonId: string,
    @Param('itemId') itemId: string,
    @Body() body: VocabularyStudyDto,
  ): Promise<VocabularyStudyResponse> {
    return this.courseProgress.studyVocabularyItem(
      userId,
      routeVersionId,
      lessonId,
      itemId,
      body.result,
    )
  }
}
