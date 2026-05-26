import { cryptoHash } from "@lib/utils/cryptoHash";
import { VerificationTokenRepository } from "./verification-token.repository";

export const VerificationTokenService = {
  createVerificationToken: async ({ userId, type }: {
    userId: number;
    type: 'emailVerification' | 'passwordReset' | 'phoneVerification'
  }) => {
    const token = crypto.randomUUID();
    const tokenHash = await cryptoHash(token)
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000)

    const insertedToken = await VerificationTokenRepository.insert({
      userId,
      tokenHash,
      type,
      createdAt,
      expiresAt,
    });

    if (!insertedToken)
      return null;

    return {
      token,
      ...insertedToken,
    };
  },


  findByTokenHash: async (tokenHash: string) => {
    const foundToken = await VerificationTokenRepository.selectByTokenHash({ tokenHash });

    if (!foundToken)
      return null;

    return foundToken;
  },

  invalidateToken: async (id: number) => {
    // const updatedToken = await VerificationTokenRepository.update(id, {

    // });

    // if (!updatedToken)
    //   return null;

    // return updatedToken;
  }

}
