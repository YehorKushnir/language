import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { AppModule } from '../src/app.module'
import { configureApp } from '../src/configure-app'
import { PrismaService } from '../src/database/prisma.service'
import { SessionIdentityGuard } from '../src/identity/session-identity.guard'

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
      .overrideGuard(SessionIdentityGuard)
      .useValue({ canActivate: () => true })
      .compile()

    app = moduleFixture.createNestApplication()
    configureApp(app)
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('reports its health', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect({ status: 'ok', database: 'ok', morphology: 'ok' })

    expect(response.headers['x-content-type-options']).toBe('nosniff')
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN')
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
      requestId: expect.any(String),
    })
    expect(response.headers['x-request-id']).toBe(response.body.requestId)
  })

  it('analyzes an inflected Finnish word through the API', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/language/fi/analyze-word')
      .send({ word: 'opiskelijoita' })
      .expect(200)

    expect(response.body).toMatchObject({
      word: 'opiskelijoita',
      isKnown: true,
      analyses: expect.arrayContaining([
        expect.objectContaining({
          lemma: 'opiskelija',
          partOfSpeech: 'noun',
          features: expect.objectContaining({
            case: 'partitive',
            number: 'plural',
          }),
        }),
      ]),
    })
  })

  it('returns spelling suggestions through the API', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/language/fi/spell')
      .send({ word: 'opiskleija' })
      .expect(200)

    expect(response.body).toMatchObject({
      word: 'opiskleija',
      isCorrect: false,
      suggestions: expect.arrayContaining(['opiskelija']),
    })
  })

  it('rejects multiple words in a word-analysis request', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/language/fi/analyze-word')
      .send({ word: 'kaksi sanaa' })
      .expect(400)

    expect(response.body.message).toBe('Expected one word without spaces')
  })

  it('exposes sentence splitting and hyphenation', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/language/fi/sentences')
      .send({ text: 'Hei. Miten menee?' })
      .expect(200)
      .expect((response) => {
        expect(response.body.sentences).toHaveLength(2)
        expect(response.body.sentences[0]).toMatchObject({
          text: 'Hei. ',
          charStart: 0,
          charEnd: 5,
        })
      })

    await request(app.getHttpServer())
      .post('/api/v1/language/fi/hyphenate')
      .send({ word: 'opiskelija' })
      .expect(200)
      .expect({ word: 'opiskelija', hyphenated: 'o-pis-ke-li-ja' })
  })
})
