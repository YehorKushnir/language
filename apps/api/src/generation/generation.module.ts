import { Module } from '@nestjs/common'

import { ExerciseGenerationService } from './exercise-generation.service'

@Module({
  providers: [ExerciseGenerationService],
  exports: [ExerciseGenerationService],
})
export class GenerationModule {}
