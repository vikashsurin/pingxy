import { NewSession } from "@chat/shared/types";
import { eq } from "drizzle-orm";
import db from "src/common/db/client";
import { sessions, users } from "@chat/shared/db/schemas";

export const SessionRepository = {

  insertSession: async (session: NewSession) => {
    return await db.insert(sessions).values(session).returning();
  },

  selectSession: async (hashed_token: string) => {
    return await db
      .select()
      .from(sessions)
      .where(eq(sessions.hashed_token, hashed_token))
      .limit(1);
  },

  selectSessionUser: async (hashed_token: string) => {
    return await db
      .select({
        session: {
          session_id: sessions.session_id,
          user_id: sessions.user_id,
          last_activity: sessions.last_activity,
          is_active: sessions.is_active,
          ip_address: sessions.ip_address,
        },
        user: {
          id: users.id,
          username: users.username,
          user_type: users.user_type,
          data: users.data,
          last_seen_at: users.last_seen_at,
          created_at: users.created_at,
          updated_at: users.updated_at,
        },
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.user_id, users.id))
      .where(eq(sessions.hashed_token, hashed_token))
      .limit(1);
  },

  updateSessionActivity: async (hashed_token: string) => {
    return await db
      .update(sessions)
      .set({ last_activity: Math.floor(Date.now() / 1000) })
      .where(eq(sessions.hashed_token, hashed_token))
      .returning();
  },

  deleteSession: async (hashed_token: string) => {
    return await db
      .delete(sessions)
      .where(eq(sessions.hashed_token, hashed_token))
      .returning({
        session_id: sessions.session_id,
      });
  },
}
