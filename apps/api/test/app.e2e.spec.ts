import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { AppModule } from '../src/app.module'
import { configureApp } from '../src/configure-app'
import { PrismaService } from '../src/database/prisma.service'

describe('AppController (e2e)', () => {
  let app: INestApplication
  const queryDatabase = vi.fn().mockResolvedValue([{ connected: 1 }])

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $queryRaw: queryDatabase,
        $disconnect: vi.fn(),
      })
      .compile()

    app = moduleFixture.createNestApplication()
    configureApp(app)
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('reports its health', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect({ status: 'ok', database: 'ok' })
  })

  it('reports an unavailable database without a generic 500', async () => {
    queryDatabase.mockRejectedValueOnce({ code: 'P1001' })

    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(503)

    expect(response.body).toEqual({
      statusCode: 503,
      code: 'DATABASE_UNAVAILABLE',
      message:
        'База данных недоступна. Для локального запуска выполните pnpm dev:setup.',
    })
  })
})
