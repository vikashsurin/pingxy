import { eq } from "drizzle-orm";
import db from "../client";
import { NewSession, Session, sessions } from "../schema";

export const insertSession = async (session: NewSession) => {
  return await db
    .insert(sessions)
    .values(session)
    .returning();

};

export const selectSession = async (session_id: string) => {
  return await db
    .select()
    .from(sessions)
    .where(eq(sessions.session_id, session_id))
};

export const updateSessionActivity = async (session_id: string) => {
  return await db
    .update(sessions)
    .set({ last_activity: Math.floor(Date.now() / 1000) })
    .where(eq(sessions.session_id, session_id))
    .returning()
};

export const deleteSession = async (session_id: string) => {
  return await db
    .delete(sessions)
    .where(eq(sessions.session_id, session_id))
    .returning()
};


// Optional query
// export const selectIsSessionExpired = async (session_id: string) => {
//   return await db
//     .select({ expires_at: sessions.expires_at })
//     .from(sessions)
//     .where(eq(sessions.session_id, session_id))

// };