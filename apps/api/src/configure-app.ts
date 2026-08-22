import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { ApplicationExceptionFilter } from './common/application-exception.filter'

export function configureApp(app: INestApplication) {
  const config = app.get(ConfigService)

  app.setGlobalPrefix('api')
  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  })
  app.enableCors({
    credentials: true,
    origin: config.get<string>('WEB_ORIGIN', 'http://localhost:5173'),
  })
  app.useGlobalFilters(new ApplicationExceptionFilter())
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  )
}
