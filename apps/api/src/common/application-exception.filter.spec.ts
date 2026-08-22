import { describe, expect, it } from 'vitest'

import { getPrismaErrorCode } from './application-exception.filter'

describe('getPrismaErrorCode', () => {
  it('reads a known request error code', () => {
    expect(getPrismaErrorCode({ code: 'P1001' })).toBe('P1001')
  })

  it('reads an initialization error code', () => {
    expect(getPrismaErrorCode({ errorCode: 'P1000' })).toBe('P1000')
  })

  it('ignores unrelated errors', () => {
    expect(getPrismaErrorCode(new Error('boom'))).toBeNull()
  })
})
