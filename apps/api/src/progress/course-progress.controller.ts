import type {
  CourseProgressResponse,
  LessonPart,
  VocabularyStudyResponse,
} from '@language/contracts'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseEnumPipe,
  Put,
  UseGuards,
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { CurrentUserId } from '../identity/current-user.decorator'
import { SessionIdentityGuard } from '../identity/session-identity.guard'
import { CourseProgressService } from './course-progress.service'
import { VocabularyStudyDto } from './vocabulary-study.dto'

enum LessonPartParam {
  Explanation = 'explanation',
  Vocabulary = 'vocabulary',
  Practice = 'practice',
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
