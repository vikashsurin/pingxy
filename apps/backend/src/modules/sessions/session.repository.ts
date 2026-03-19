import { sessionInsertSchema, sessions, users } from "@pingxy/shared";
import { eq } from "drizzle-orm";
import db from "@lib/db/client";
import z from "zod";
import { safeUserColumns } from "@modules/users/user.repository";

export const SessionRepository = {
  insertSession: async (session: z.infer<typeof sessionInsertSchema>) => {
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
          id: sessions.id,
          userId: sessions.userId,
          lastActivity: sessions.lastActivity,
          isActive: sessions.isActive,
          ipAddress: sessions.ipAddress,
        },
        user: {
          ...safeUserColumns,
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
        id: sessions.id,
      });
  },
};
