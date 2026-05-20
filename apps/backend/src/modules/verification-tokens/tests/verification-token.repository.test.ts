import { describe, it, expect } from 'bun:test'
import { VerificationTokenRepository } from '../verification-token.repository'

describe('VerificationTokenRepository', () => {
  it('should insert a verification token', async () => {
    const uuid = crypto.randomUUID()
    const token = await VerificationTokenRepository.insert(
      {
        userId: 2,
        token: uuid,
        type: 'emailVerification' as const,
        expiresAt: new Date(),
        createdAt: new Date(),
      },
    )
    console.log({ token })
    expect(token).toBeDefined()
  })
})
