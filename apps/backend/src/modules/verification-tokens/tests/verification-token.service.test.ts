import { describe, expect, it } from 'bun:test'
import { VerificationTokenService } from '../verification-token.service'

describe('VerificationTokenRepository', () => {
  it('should create a verification token', async () => {
    const token = await VerificationTokenService.createToken(
      {
        userId: 2,
        type: 'emailVerification' as const,
      },
    )
    console.log({ token })
    expect(token).toBeDefined()
  })
})
