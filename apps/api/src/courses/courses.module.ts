import { Module } from '@nestjs/common'

import { CourseCatalogController } from './course-catalog.controller'
import { CourseCatalogService } from './course-catalog.service'

@Module({
  controllers: [CourseCatalogController],
  providers: [CourseCatalogService],
})
export class CoursesModule {}
