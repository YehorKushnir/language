import type {
  LessonDetailResponse,
  LessonVocabularyResponse,
} from '@language/contracts'
import { Controller, Get, Param } from '@nestjs/common'
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { LessonCatalogService } from './lesson-catalog.service'

@ApiTags('lessons')
@Controller('lessons')
export class LessonCatalogController {
  constructor(private readonly lessonCatalog: LessonCatalogService) {}

  @Get(':lessonId')
  @ApiOperation({ summary: 'Получить структуру урока' })
  @ApiOkResponse({ description: 'Урок и вводимые единицы знания' })
  @ApiNotFoundResponse({ description: 'Урок не найден' })
  getLesson(
    @Param('lessonId') lessonId: string,
  ): Promise<LessonDetailResponse> {
    return this.lessonCatalog.getLesson(lessonId)
  }

  @Get(':lessonId/vocabulary')
  @ApiOperation({ summary: 'Получить словарь урока' })
  @ApiOkResponse({ description: 'Лексика и формы слов из урока' })
  @ApiNotFoundResponse({ description: 'Урок не найден' })
  getVocabulary(
    @Param('lessonId') lessonId: string,
  ): Promise<LessonVocabularyResponse> {
    return this.lessonCatalog.getVocabulary(lessonId)
  }
}
