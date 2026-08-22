import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { toNodeHandler } from 'better-auth/node'

import { AppModule } from './app.module'
import { AuthService } from './auth/auth.service'
import { configureApp } from './configure-app'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  })
  const config = app.get(ConfigService)

  configureApp(app)

  const auth = app.get(AuthService)
  const express = app.getHttpAdapter().getInstance()
  express.all(`${auth.basePath}/*splat`, toNodeHandler(auth.auth))

  // BetterAuth must receive the raw request body. Nest parsers are mounted only
  // after its handler, while the rest of the API keeps normal JSON parsing.
  app.useBodyParser('json')
  app.useBodyParser('urlencoded', { extended: true })

  const openApiConfig = new DocumentBuilder()
    .setTitle('Language Learning API')
    .setDescription('API курса русского → финского')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, openApiConfig)
  SwaggerModule.setup('docs', app, document)

  await app.listen(config.get<number>('API_PORT', 3000))
}

void bootstrap()
