import { eq } from "drizzle-orm";
import db from "../client";
import { sessions } from "../schema/_schema";
import { NewSession } from "@chat/shared/src/lib/utils/temp";

export const insertSession = async (session: NewSession) => {
  return await db.insert(sessions).values(session).returning();
};

export const selectSession = async (session_id: number) => {
  return await db
    .select()
    .from(sessions)
    .where(eq(sessions.session_id, session_id));
};

export const selectSessionByToken = async (hashed_token: string) => {
  return await db
    .select()
    .from(sessions)
    .where(eq(sessions.hashed_token, hashed_token))
    .limit(1);
};

// ... existing exports ...

export const updateSessionActivity = async (session_id: number) => {
  return await db
    .update(sessions)
    .set({ last_activity: Math.floor(Date.now() / 1000) })
    .where(eq(sessions.session_id, session_id))
    .returning();
};

export const updateSessionActivityByToken = async (hashed_token: string) => {
  return await db
    .update(sessions)
    .set({ last_activity: Math.floor(Date.now() / 1000) })
    .where(eq(sessions.hashed_token, hashed_token))
    .returning();
};

export const deleteSession = async (session_id: number) => {
  return await db
    .delete(sessions)
    .where(eq(sessions.session_id, session_id))
    .returning();
};

export const deleteSessionByToken = async (hashed_token: string) => {
  return await db
    .delete(sessions)
    .where(eq(sessions.hashed_token, hashed_token))
    .returning();
};

// Optional query
// export const selectIsSessionExpired = async (session_id: string) => {
//   return await db
//     .select({ expires_at: sessions.expires_at })
//     .from(sessions)
//     .where(eq(sessions.session_id, session_id))

// };
