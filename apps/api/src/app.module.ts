import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { CoursesModule } from './courses/courses.module'
import { DatabaseModule } from './database/database.module'
import { HealthController } from './health.controller'
import { LessonsModule } from './lessons/lessons.module'
import { ExercisesModule } from './exercises/exercises.module'
import { ProgressModule } from './progress/progress.module'
import { ReviewsModule } from './reviews/reviews.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['../../.env', '.env'],
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    CoursesModule,
    LessonsModule,
    ExercisesModule,
    ProgressModule,
    ReviewsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
