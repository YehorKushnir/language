import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

import { AccountModule } from './account/account.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { CoursesModule } from './courses/courses.module'
import { DatabaseModule } from './database/database.module'
import { HealthController } from './health.controller'
import { LessonsModule } from './lessons/lessons.module'
import { MediaModule } from './media/media.module'
import { MorphologyModule } from './morphology/morphology.module'
import { ExercisesModule } from './exercises/exercises.module'
import { ProgressModule } from './progress/progress.module'
import { ReviewsModule } from './reviews/reviews.module'
import { TextsModule } from './texts/texts.module'
import { TelemetryModule } from './telemetry/telemetry.module'
import { VocabularyModule } from './vocabulary/vocabulary.module'
import { validateEnvironment } from './environment'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['../../.env', '.env'],
      isGlobal: true,
      validate: validateEnvironment,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    DatabaseModule,
    AccountModule,
    AuthModule,
    MediaModule,
    MorphologyModule,
    CoursesModule,
    LessonsModule,
    ExercisesModule,
    ProgressModule,
    ReviewsModule,
    VocabularyModule,
    TextsModule,
    TelemetryModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
