import type { CourseOverviewResponse } from '@language/contracts'
import { Controller, Get, Param } from '@nestjs/common'
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { CourseCatalogService } from './course-catalog.service'

@ApiTags('courses')
@Controller('courses')
export class CourseCatalogController {
  constructor(private readonly courseCatalog: CourseCatalogService) {}

  @Get(':courseId')
  @ApiOperation({ summary: 'Получить опубликованный маршрут курса' })
  @ApiOkResponse({ description: 'Курс и актуальный маршрут уроков' })
  @ApiNotFoundResponse({ description: 'Курс не найден' })
  getCourse(
    @Param('courseId') courseId: string,
  ): Promise<CourseOverviewResponse> {
    return this.courseCatalog.getCourse(courseId)
  }
}
