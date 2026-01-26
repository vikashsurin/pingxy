import { NewSession, PublicUser } from "@chat/shared/types";
import { SessionRepository } from "./session.repository";

const secret = "temp_secret";

export const SessionService = {

  hashSessionToken: (token: string) => {
    const hasher = new Bun.CryptoHasher("sha256", secret);
    const hashed_token = hasher.update(token).digest("hex");
    return hashed_token;
  },

  createSession: async (
    token: string,
    user_id: number,
    ip_address: string,
    user_agent: string | null | undefined,
  ) => {
    try {
      const hashed_token = SessionService.hashSessionToken(token);
      const refresh_token = crypto.randomUUID();
      const expires_at = Math.floor(Date.now() / 1000) + 30 * 60;

      const newSession: NewSession = {
        hashed_token: hashed_token,
        user_id: user_id,
        ip_address: ip_address,
        user_agent: user_agent,
        refresh_token: refresh_token,
        is_active: true,
        last_activity: Math.floor(Date.now() / 1000),
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000),
        expires_at: expires_at,
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
      const hashed_token = SessionService.hashSessionToken(token);
      const [session] = await SessionRepository.selectSession(hashed_token);
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
      const hashed_token = SessionService.hashSessionToken(token);
      const [result] = await SessionRepository.deleteSession(hashed_token);
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
      const hashed_token = SessionService.hashSessionToken(token);
      const [result] = await SessionRepository.selectSessionUser(hashed_token);
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
      const hashed_token = SessionService.hashSessionToken(token);
      await SessionRepository.updateSessionActivity(hashed_token);
    } catch (error) {
      console.error("Error updating session activity:", error);
    }
  },
}
