import { Module } from '@nestjs/common'

import { CourseProgressController } from './course-progress.controller'
import { CourseProgressService } from './course-progress.service'

@Module({
  controllers: [CourseProgressController],
  providers: [CourseProgressService],
})
export class ProgressModule {}
