import { NewSession, PublicUser } from "@pingxy/shared/types";
import { SessionRepository } from "./session.repository";

const secret = "temp_secret";

export const SessionService = {

  hashSessionToken: (token: string) => {
    const hasher = new Bun.CryptoHasher("sha256", secret);
    const hashedToken = hasher.update(token).digest("hex");
    return hashedToken;
  },

  createSession: async (
    token: string,
    userId: number,
    ipAddress: string,
    userAgent: string | null | undefined,
  ) => {
    try {
      const hashedToken = SessionService.hashSessionToken(token);
      const refreshToken = crypto.randomUUID();
      const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;

      const newSession: NewSession = {
        hashedToken: hashedToken,
        userId: userId,
        ipAddress: ipAddress,
        userAgent: userAgent,
        refreshToken: refreshToken,
        isActive: true,
        lastActivity: Math.floor(Date.now() / 1000),
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
        expiresAt: expiresAt,
      };
      const [session] = await SessionRepository.insertSession(newSession);
      return session;
    } catch (error) {
      console.error("Error creating session:", error);
      throw new Error("Error creating session");
    }
  },

  getSession: async (token: string) => {
    try {
      const hashedToken = SessionService.hashSessionToken(token);
      const [session] = await SessionRepository.selectSession(hashedToken);
      if (!session) {
        throw new Error("Session not found");
      }
      return session;
    } catch (error) {
      console.error("Error getting session:", error);
      throw new Error("Error getting session");
    }
  },

  revokeSession: async (token: string) => {
    try {
      const hashedToken = SessionService.hashSessionToken(token);
      const [result] = await SessionRepository.deleteSession(hashedToken);
      if (!result) {
        throw new Error("Session not found");
      }
      return result;
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  },

  getSessionUser: async (token: string): Promise<PublicUser> => {
    try {
      const hashedToken = SessionService.hashSessionToken(token);
      const [result] = await SessionRepository.selectSessionUser(hashedToken);
      if (!result) {
        throw new Error("User not found");
      }
      // Result returns { session, user }
      return result.user as PublicUser;
    } catch (error) {
      throw new Error("Error getting user!");
    }
  },

  extendSessionActivity: async (token: string) => {
    try {
      const hashedToken = SessionService.hashSessionToken(token);
      await SessionRepository.updateSessionActivity(hashedToken);
    } catch (error) {
      console.error("Error updating session activity:", error);
    }
  },
}
