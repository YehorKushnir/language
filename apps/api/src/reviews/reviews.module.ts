import { Module } from '@nestjs/common'

import { GenerationModule } from '../generation/generation.module'
import { ReviewQueueController } from './review-queue.controller'
import { ReviewQueueService } from './review-queue.service'

@Module({
  imports: [GenerationModule],
  controllers: [ReviewQueueController],
  providers: [ReviewQueueService],
})
export class ReviewsModule {}
