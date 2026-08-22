import { Module } from '@nestjs/common'

import { LessonCatalogController } from './lesson-catalog.controller'
import { LessonCatalogService } from './lesson-catalog.service'

@Module({
  controllers: [LessonCatalogController],
  providers: [LessonCatalogService],
})
export class LessonsModule {}
