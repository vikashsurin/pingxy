import { VerificationTokenRepository } from "./verification-token.repository";

export const VerificationTokenService = {
  verify: async ({ userId, type }: {
    userId: number;
    type: 'emailVerification' | 'passwordReset' | 'phoneVerification'
  }) => {
    const token = crypto.randomUUID();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000)

    const insertedToken = await VerificationTokenRepository.insert({
      userId,
      token,
      type,
      expiresAt,
      createdAt,
    });

    if (!insertedToken)
      return null;

    return {
      ...insertedToken,
    };
  },

  invalidateToken: async (id: number) => {
    // const updatedToken = await VerificationTokenRepository.update(id, {

    // });

    // if (!updatedToken)
    //   return null;

    // return updatedToken;
  }

}
