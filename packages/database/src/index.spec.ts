import { describe, expect, it } from 'vitest'

import { DatabaseClient } from './index.js'

describe('DatabaseClient', () => {
  it('can be created without opening a database connection', async () => {
    const client = new DatabaseClient()

    expect(client).toBeDefined()
    await client.$disconnect()
  })
})
