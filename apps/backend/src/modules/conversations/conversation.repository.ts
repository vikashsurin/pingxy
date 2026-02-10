import { conversations, participants, users } from "@pingxy/shared/domain";
import { type InsertConversationType } from "@pingxy/shared/types";
import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import db from "src/common/db/client";

import { type DB_TX } from "src/common/db/client";

export const ConversationRepository = {
  insert: async (conversation: InsertConversationType, tx: DB_TX = db) => {
    return await tx.insert(conversations).values(conversation).returning();
  },

  selectById: async (id: number) => {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.conversationId, id))
      .limit(1);
  },

  // Select conversation by 2 distinct Users
  selectByUsersPrecise: async (userId1: number, userId2: number) => {
    const userIds = [userId1, userId2].sort(); // Sort for consistency

    // Subquery: Find conversation IDs that have both users
    const conversationsWithBothUsers = db
      .select({ conversationId: participants.conversationId })
      .from(participants)
      .where(inArray(participants.userId, userIds))
      .groupBy(participants.conversationId)
      .having(sql`count(distinct ${participants.userId}) = 2`)
      .as("matched_conversations");

    // Main query: Get the conversation, but only if it has exactly 2 participants total
    const result = await db
      .select({ conversation: conversations })
      .from(conversations)
      .innerJoin(
        conversationsWithBothUsers,
        eq(
          conversations.conversationId,
          conversationsWithBothUsers.conversationId,
        ),
      )
      .innerJoin(
        participants,
        eq(participants.conversationId, conversations.conversationId),
      )
      .groupBy(conversations.conversationId, conversations.createdAt)
      .having(sql`count(${participants.userId}) = 2`);

    return result[0] || null;
  },

  selectByUserId: async (userId: number) => {
    const p1 = alias(participants, "p1");
    const p2 = alias(participants, "p2");

    // Get conversations with all participant details
    const result = await db
      .select({
        conversationId: conversations.conversationId,
        createdAt: conversations.createdAt,
        user: {
          id: users.id,
          username: users.username,
          userType: users.userType,
          data: users.data,
          lastSeenAt: users.lastSeenAt,
        },
      })
      .from(conversations)
      .innerJoin(p1, eq(p1.conversationId, conversations.conversationId))
      .innerJoin(
        p2,
        and(
          eq(p2.conversationId, conversations.conversationId),
          ne(p2.userId, userId),
        ),
      )
      .innerJoin(users, eq(users.id, p2.userId))
      .where(eq(p1.userId, userId))
      .orderBy(desc(conversations.createdAt))
      .limit(10);
    return result;
  },

  selectDirectExisting: async (
    userIdA: number,
    userIdB: number,
    tx: any = db, // Use transaction if provided, else default db
  ) => {
    // 1. Canonical sorting to ensure id1 < id2 for consistent lookups
    const [id1, id2] = [userIdA, userIdB].sort((a, b) => a - b);

    // 2. Alias the participants table to fetch the second user specifically
    const p2 = alias(participants, "p2");

    const result = await tx
      .select({
        conversation: conversations,
        participant1: participants,
        participant2: p2,
      })
      .from(conversations)
      // Join first participant (id1)
      .innerJoin(
        participants,
        eq(conversations.conversationId, participants.conversationId),
      )
      // Join second participant (id2) to ensure both are in the result
      .innerJoin(p2, eq(conversations.conversationId, p2.conversationId))
      .where(
        and(
          eq(conversations.conversationType, "direct"),
          eq(conversations.isDeleted, false),
          eq(participants.userId, id1),
          eq(p2.userId, id2),
        ),
      )
      .limit(1);

    // Return the first match or null if not found
    return result[0] ?? null;
  },

  delete: async (id: number) => {
    return await db
      .delete(conversations)
      .where(eq(conversations.conversationId, id))
      .returning();
  },
};
