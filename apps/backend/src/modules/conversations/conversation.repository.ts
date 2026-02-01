import { type NewConversation } from "@pingxy/shared/types";
import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import db from "src/common/db/client";
import { conversations, participants, users } from "@pingxy/shared/db/schemas";
import { type DB_TX } from "src/common/db/client";

export const ConversationRepository = {
  insert: async (
    conversation: NewConversation,
    tx: DB_TX = db,
  ) => {
    return await tx.insert(conversations).values(conversation).returning();
  },

  selectById: async (id: number) => {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.conversation_id, id))
      .limit(1);
  },

  // Select conversation by 2 distinct Users
  selectByUsersPrecise: async (
    userId1: number,
    userId2: number,
  ) => {
    const userIds = [userId1, userId2].sort(); // Sort for consistency

    // Subquery: Find conversation IDs that have both users
    const conversationsWithBothUsers = db
      .select({ conversation_id: participants.conversation_id })
      .from(participants)
      .where(inArray(participants.user_id, userIds))
      .groupBy(participants.conversation_id)
      .having(sql`count(distinct ${participants.user_id}) = 2`)
      .as("matched_conversations");

    // Main query: Get the conversation, but only if it has exactly 2 participants total
    const result = await db
      .select({ conversation: conversations })
      .from(conversations)
      .innerJoin(
        conversationsWithBothUsers,
        eq(
          conversations.conversation_id,
          conversationsWithBothUsers.conversation_id,
        ),
      )
      .innerJoin(
        participants,
        eq(participants.conversation_id, conversations.conversation_id),
      )
      .groupBy(conversations.conversation_id, conversations.created_at)
      .having(sql`count(${participants.user_id}) = 2`);

    return result[0] || null;
  },

  selectByUserId: async (userId: number) => {
    const p1 = alias(participants, "p1");
    const p2 = alias(participants, "p2");

    // Get conversations with all participant details
    const result = await db
      .select({
        conversation_id: conversations.conversation_id,
        created_at: conversations.created_at,
        user: {
          id: users.id,
          username: users.username,
          user_type: users.user_type,
          data: users.data,
          last_seen_at: users.last_seen_at,
        },
      })
      .from(conversations)
      .innerJoin(p1, eq(p1.conversation_id, conversations.conversation_id))
      .innerJoin(
        p2,
        and(
          eq(p2.conversation_id, conversations.conversation_id),
          ne(p2.user_id, userId),
        ),
      )
      .innerJoin(users, eq(users.id, p2.user_id))
      .where(eq(p1.user_id, userId))
      .orderBy(desc(conversations.created_at))
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
        eq(conversations.conversation_id, participants.conversation_id),
      )
      // Join second participant (id2) to ensure both are in the result
      .innerJoin(p2, eq(conversations.conversation_id, p2.conversation_id))
      .where(
        and(
          eq(conversations.conversation_type, "direct"),
          eq(conversations.is_deleted, false),
          eq(participants.user_id, id1),
          eq(p2.user_id, id2),
        ),
      )
      .limit(1);

    // Return the first match or null if not found
    return result[0] ?? null;
  },

  delete: async (id: number) => {
    return await db
      .delete(conversations)
      .where(eq(conversations.conversation_id, id))
      .returning();
  },

}
