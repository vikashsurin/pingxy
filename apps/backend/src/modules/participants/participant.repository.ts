import { conversations, ParticipantInsertType, participants } from "@pingxy/shared";
import { aliasedTable, and, eq, ne, sql } from "drizzle-orm";
import db, { type DB_TX } from "src/common/db/client";

export const ParticipantRepository = {
  insertParticipant: async (
    participant: ParticipantInsertType,
    tx: DB_TX = db,
  ) => {
    return await tx
      .insert(participants)
      .values({
        conversationId: participant.conversationId,
        userId: participant.userId,
        role: participant.role,
        joinedAt: participant.joinedAt,
        leftAt: participant.leftAt,
        isActive: participant.isActive,
      })
      .onConflictDoUpdate({
        target: [participants.conversationId, participants.userId],
        set: {
          leftAt: null,
          isActive: true,
        },
      })
      .returning();
  },

  selectParticipant: async ({
    conversationId,
    userId,
  }: {
    conversationId: number;
    userId: number;
  }) => {
    return await db
      .select()
      .from(participants)
      .where(
        and(
          eq(participants.conversationId, conversationId),
          eq(participants.userId, userId),
        ),
      )
      .limit(1);
  },

  selectParticipantById: async (participantId: number) => {
    return await db
      .select()
      .from(participants)
      .where(eq(participants.participantId, participantId))
      .limit(1);
  },

  selectParticipantsByConversationId: async (conversationId: number) => {
    return await db
      .select()
      .from(participants)
      .where(eq(participants.conversationId, conversationId));
  },

  updateParticipantRole: async (
    conversationId: number,
    userId: number,
    role: "admin" | "moderator" | "member",
  ) => {
    return await db
      .update(participants)
      .set({ role })
      .where(
        and(
          eq(participants.conversationId, conversationId),
          eq(participants.userId, userId),
        ),
      )
      .returning();
  },

  deleteParticipant: async (conversationId: number, userId: number) => {
    return await db
      .delete(participants)
      .where(
        and(
          eq(participants.conversationId, conversationId),
          eq(participants.userId, userId),
        ),
      )
      .returning();
  },

  selectActiveParticipants: async (conversationId: number) => {
    return await db
      .select()
      .from(participants)
      .where(
        and(
          eq(participants.conversationId, conversationId),
          eq(participants.isActive, true),
        ),
      );
  },

  selectIsUserInConversation: async (
    conversationId: number,
    userId: number,
  ) => {
    return await db
      .select()
      .from(participants)
      .where(
        and(
          eq(participants.conversationId, conversationId),
          eq(participants.userId, userId),
        ),
      )
      .limit(1);
  },

  selectDirectMessageConversationId: async (
    userId: number,
    otherUserId: number,
  ) => {
    const p1 = aliasedTable(participants, "p1");
    const p2 = aliasedTable(participants, "p2");

    return await db
      .select({
        conversationId: p1.conversationId,
        conversationType: conversations.conversationType,
      })
      .from(p1)
      .innerJoin(p2, eq(p1.conversationId, p2.conversationId))
      .innerJoin(
        conversations,
        eq(p1.conversationId, conversations.conversationId),
      )
      .where(
        and(
          eq(p1.userId, userId),
          eq(p2.userId, otherUserId),
          eq(conversations.conversationType, "direct"),
        ),
      )
      .limit(1);
  },

  incrementUnreadCount: async ({
    conversationId,
    senderId,
  }: {
    conversationId: number;
    senderId: number;
  }) => {
    return await db
      .update(participants)
      .set({ unreadCount: sql`${participants.unreadCount}+1` })
      .where(
        and(
          eq(participants.conversationId, conversationId),
          ne(participants.userId, senderId),
        ),
      );
  },

  resetUnreadCount: async ({
    userId,
    conversationId,
    messageId,
  }: {
    userId: number;
    conversationId: number;
    messageId: number;
  }) => {
    const now = new Date(Date.now());
    return await db
      .update(participants)
      .set({
        unreadCount: 0,
        lastReadMessageId: messageId,
        lastReadAt: now,
      })
      .where(
        and(
          eq(participants.userId, userId),
          eq(participants.conversationId, conversationId),
        ),
      );
  },
};
