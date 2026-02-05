import { eq } from "drizzle-orm";
import db from "src/common/db/client";
import { sessions, users } from "@pingxy/shared";
import { InsertSessionType } from "@pingxy/shared/domain";

export const SessionRepository = {
  insertSession: async (session: InsertSessionType) => {
    return await db.insert(sessions).values(session).returning();
  },

  selectSession: async (hashedToken: string) => {
    return await db
      .select()
      .from(sessions)
      .where(eq(sessions.hashedToken, hashedToken))
      .limit(1);
  },

  selectSessionUser: async (hashedToken: string) => {
    return await db
      .select({
        session: {
          sessionId: sessions.sessionId,
          userId: sessions.userId,
          lastActivity: sessions.lastActivity,
          isActive: sessions.isActive,
          ipAddress: sessions.ipAddress,
        },
        user: {
          id: users.id,
          username: users.username,
          userType: users.userType,
          data: users.data,
          lastSeenAt: users.lastSeenAt,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.hashedToken, hashedToken))
      .limit(1);
  },

  updateSessionActivity: async (hashedToken: string) => {
    return await db
      .update(sessions)
      .set({ lastActivity: Math.floor(Date.now() / 1000) })
      .where(eq(sessions.hashedToken, hashedToken))
      .returning();
  },

  deleteSession: async (hashedToken: string) => {
    return await db
      .delete(sessions)
      .where(eq(sessions.hashedToken, hashedToken))
      .returning({
        sessionId: sessions.sessionId,
      });
  },
};
