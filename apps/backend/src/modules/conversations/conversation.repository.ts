import db from "@lib/db/client";
import { conversations, participants, users } from "@pingxy/shared/domain";
import { publicUserColumns } from "@pingxy/shared/domain/user/user.schema";
import { type InsertConversationType } from "@pingxy/shared/types";
import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { type DB_TX } from "@lib/db/client";

export const ConversationRepository = {
  insert: async (conversation: InsertConversationType, tx: DB_TX = db) => {
    return await tx.insert(conversations).values(conversation).returning();
  },

  selectConversations: async ({ userId, type, tx = db }: { userId: number; type?: 'direct' | 'group'; tx?: DB_TX }) => {
    const c = conversations;
    const p = participants;
    const rows = await tx
      .select({
        id: c.id,
        type: c.type,
        name: c.name,
        description: c.description,
        lastMessageId: c.lastMessageId,
        lastMessageAt: c.lastMessageAt,
        isPrivate: c.isPrivate,
        user1Id: c.user1Id,
        user2Id: c.user2Id,
        createdBy: c.createdBy
      })
      .from(c)
      .innerJoin(p, eq(p.conversationId, c.id))
      .where(
        and(
          eq(p.userId, userId),
          type ? eq(c.type, type) : undefined
        )
      )

    return rows;
  },



  updateActivity: async ({
    id,
    lastMessageId,
    tx = db,
  }: {
    id: number;
    lastMessageId: number;
    tx?: DB_TX;
  }) => {
    return await tx
      .update(conversations)
      .set({ lastMessageId: lastMessageId, lastMessageAt: sql`now()` })
      .where(eq(conversations.id, id))
      .returning({
        id: conversations.id,
        type: conversations.type,
        name: conversations.name,
        lastMessageId: conversations.lastMessageId,
        lastMessageAt: conversations.lastMessageAt,
      });
  },

  selectById: async (id: number) => {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1);
  },

  selectAll: async ({ userId, tx = db }: { userId: number; tx?: DB_TX }) => {
    const c = conversations;
    const p = participants;
    const rows = await tx
      .select({
        id: c.id,
        type: c.type,
        name: c.name,
        description: c.description,
        lastMessageId: c.lastMessageId,
        lastMessageAt: c.lastMessageAt,
        isPrivate: c.isPrivate,
        user1Id: c.user1Id,
        user2Id: c.user2Id,
        createdBy: c.createdBy
      })
      .from(c)
      .innerJoin(p, eq(p.conversationId, c.id))
      .where(eq(p.userId, userId));

    return rows;
  },

  selectManyById: async ({ ids, tx = db }: { ids: number[]; tx?: DB_TX }) => {
    return await tx
      .select()
      .from(conversations)
      .where(inArray(conversations.id, ids))
      .limit(10);
  },

  isUserInConversation: async ({
    conversationId,
    userId,
    tx = db,
  }: {
    userId: number;
    conversationId: number;
    tx?: DB_TX;
  }) => {
    const result = await tx
      .select()
      .from(participants)
      .where(
        and(
          eq(participants.conversationId, conversationId),
          eq(participants.userId, userId),
        ),
      );
    return result.length > 0;
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
        eq(conversations.id, conversationsWithBothUsers.conversationId),
      )
      .innerJoin(
        participants,
        eq(participants.conversationId, conversations.id),
      )
      .groupBy(conversations.id, conversations.createdAt)
      .having(sql`count(${participants.userId}) = 2`);

    return result[0] || null;
  },

  selectPartnerByConversationId: async ({
    tx = db,
    userId,
    conversationId,
  }: {
    tx?: DB_TX;
    userId: number;
    conversationId: number;
  }) => {
    const result = await tx
      .select({
        ...publicUserColumns,
      })
      .from(participants)
      .innerJoin(users, eq(participants.userId, users.id))
      .where(
        and(
          eq(participants.conversationId, conversationId),
          ne(participants.userId, userId),
        ),
      )
      .limit(1);
    return result[0] || null;
  },

  // repository — just the query, scoped to userId
  getView: async (userId: number, tx: DB_TX = db) => {
    const userConversations = db
      .select({ conversationId: participants.conversationId })
      .from(participants)
      .where(eq(participants.userId, userId));

    return await tx
      .select({
        conversationId: conversations.id,
        lastMessageAt: conversations.lastMessageAt,
        lastMessageId: conversations.lastMessageId,
        participantId: participants.id,
        participantUserId: participants.userId,
        unreadCount: participants.unreadCount,
        lastReadAt: participants.lastReadAt,
        username: users.username,
        age: users.age,
        gender: users.gender,
        country: users.country,
        lastSeenAt: users.lastSeenAt,
      })
      .from(conversations)
      .innerJoin(
        participants,
        eq(participants.conversationId, conversations.id),
      )
      .innerJoin(users, eq(users.id, participants.userId))
      .where(inArray(conversations.id, userConversations)) // 👈 scope to user
      .orderBy(desc(conversations.lastMessageAt));
  },
  //

  test: async (userId: number, tx: DB_TX = db) => {
    return await tx
      .select({
        conversationId: conversations.id,
        lastMessageAt: conversations.lastMessageAt,
        lastMessageId: conversations.lastMessageId,
        participantId: participants.id,
        participantUserId: participants.userId,
        unreadCount: participants.unreadCount,
        lastReadAt: participants.lastReadAt,
        username: users.username,
        age: users.age,
        gender: users.gender,
        country: users.country,
        lastSeenAt: users.lastSeenAt,
      })
      .from(conversations)
      .innerJoin(
        participants,
        and(
          eq(participants.conversationId, conversations.id),
          eq(participants.userId, userId), // scope to user AND get only their row
        ),
      )
      .innerJoin(users, eq(users.id, participants.userId))
      .orderBy(desc(conversations.lastMessageAt));
  },

  // selectParticipantsByConversationId: async (ids: number[], tx: DB_TX = db) => {
  //   const result =
  // }
  // selectByUserId: async (userId: number) => {
  //   const p1 = alias(participants, "p1");
  //   const p2 = alias(participants, "p2");

  //   // Get conversations with all participant details
  //   const result = await db
  //     .select({
  //       unreadCount: p1.unreadCount,
  //       conversationId: conversations.id,
  //     })
  //     .from(conversations)
  //     .innerJoin(p1, eq(p1.conversationId, conversations.id))
  //     .innerJoin(
  //       p2,
  //       and(
  //         eq(p2.conversationId, conversations.id),
  //         ne(p2.userId, userId),
  //       ),
  //     )
  //     .innerJoin(users, eq(users.id, p2.userId))
  //     .where(eq(p1.userId, userId))
  //     .orderBy(desc(conversations.createdAt))
  //     .limit(10);
  //   return result;
  // },
  //
  selectExistingBetweenUids: async (userId1: number, userId2: number, tx: DB_TX = db) => {

    const u1 = Math.min(userId1, userId2);
    const u2 = Math.max(userId1, userId2);

    const row = await tx
      .select()
      .from(conversations)
      .where(and(eq(conversations.user1Id, u1), eq(conversations.user2Id, u2)))
      .limit(1)
    return row;
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
        eq(conversations.id, participants.conversationId),
      )
      // Join second participant (id2) to ensure both are in the result
      .innerJoin(p2, eq(conversations.id, p2.conversationId))
      .where(
        and(
          eq(conversations.type, "direct"),
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
      .where(eq(conversations.id, id))
      .returning();
  },
};
