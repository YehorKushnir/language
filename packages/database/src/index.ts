import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from './generated/prisma/client.js'

const DEFAULT_DATABASE_URL =
  'postgresql://language:language@localhost:5432/language'

export class DatabaseClient extends PrismaClient {
  constructor(
    connectionString = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
  ) {
    const adapter = new PrismaPg({ connectionString })
    super({ adapter })
  }
}

export * from './generated/prisma/client.js'
