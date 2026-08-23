import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'

import { ApplicationExceptionFilter } from './common/application-exception.filter'
import { requestContextMiddleware } from './common/request-logging.interceptor'

export function configureApp(app: INestApplication) {
  const config = app.get(ConfigService)
  const trustProxyHops = config.get<number>('TRUST_PROXY_HOPS', 0)
  if (trustProxyHops > 0) {
    app.getHttpAdapter().getInstance().set('trust proxy', trustProxyHops)
  }

  app.use(requestContextMiddleware)
  app.use(helmet())
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
