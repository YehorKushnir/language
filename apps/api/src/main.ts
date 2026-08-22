import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'
import { configureApp } from './configure-app'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)

  configureApp(app)

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
