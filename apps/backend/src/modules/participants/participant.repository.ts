import db, { type DB_TX } from "@lib/db/client";
import { conversations, ParticipantInsertType, participants, users } from "@pingxy/shared";
import { aliasedTable, and, eq, inArray, ne, sql } from "drizzle-orm";

export const ParticipantRepository = {
  insertParticipant: async (
    participant: ParticipantInsertType,
    tx: DB_TX = db,
  ) => {
    const [row] = await tx
      .insert(participants)
      .values(participant)
      .onConflictDoNothing()
      .returning();
    return row ?? null;
  },

  update: async ({
    userId,
    lastReadMessageId,
    lastDeliveredMessageId,
    conversationId,
    lastReadAt,
    lastDeliveredAt,
    tx = db
  }: {
    userId: number,
    conversationId: number,
    lastReadMessageId?: number,
    lastDeliveredMessageId?: number,
    lastReadAt?: Date,
    lastDeliveredAt?: Date,
    tx?: DB_TX
  }) => {
    return await tx
      .update(participants)
      .set({
        lastDeliveredAt: lastDeliveredAt,
        lastReadMessageId: lastReadMessageId,
        lastDeliveredMessageId: lastDeliveredMessageId,
        lastReadAt: lastReadAt,
      })
      .where(
        and(
          eq(participants.conversationId, conversationId),
          eq(participants.userId, userId),
        ),
      )
      .returning({
        id: participants.id,
        role: participants.role,
        unreadCount: participants.unreadCount,
        conversationId: participants.conversationId,
        userId: participants.userId,
        lastReadMessageId: participants.lastReadMessageId,
        lastReadAt: participants.lastReadAt,
        lastDeliveredMessageId: participants.lastDeliveredMessageId,
        lastDeliveredAt: participants.lastDeliveredAt,
      });

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


  selectByUserId: async ({
    userId,
    tx = db
  }: {
    userId: number,
    tx?: DB_TX
  }) => {
    return await tx
      .select()
      .from(participants)
      .where(eq(participants.userId, userId));
  },

  selectParticipantById: async (participantId: number) => {
    return await db
      .select()
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1);
  },

  selectParticipantsByConversationId: async (conversationId: number) => {
    return await db
      .select({
        id: participants.id,
        userId: participants.userId,
        role: participants.role,
        joinedAt: participants.joinedAt,
        leftAt: participants.leftAt,
        isActive: participants.isActive,
        isMuted: participants.isMuted,
        mutedUntil: participants.mutedUntil,
        isPinned: participants.isPinned,
        isArchived: participants.isArchived,
        lastReadMessageId: participants.lastReadMessageId,
        lastReadAt: participants.lastReadAt,
        lastDeliveredMessageId: participants.lastDeliveredMessageId,
        lastDeliveredAt: participants.lastDeliveredAt,
        unreadCount: participants.unreadCount,
        notificationSettings: participants.notificationSettings,
        isDeleted: participants.isDeleted,
        deletedAt: participants.deletedAt,
        username: users.username,
      })
      .from(participants)
      .innerJoin(users, eq(participants.userId, users.id))
      .where(eq(participants.conversationId, conversationId));
  },

  test: async ({ userId, tx = db }: { userId: number, tx?: DB_TX }) => {
    const c = conversations;
    const u = users;
    const p = participants;
    return await tx
      .select()
      .from(p)
      .where(
        and(
          eq(p.userId, userId),
          eq(p.conversationId, c.id),
        )
      )
      .leftJoin(u, eq(p.userId, u.id))
      .leftJoin(c, eq(p.conversationId, c.id));
  },



  // selectManyByConvIds: async ({ conversationIds }: { conversationIds: number[] }) => {
  //   const p = participants;
  //   const u = users;
  //   return await db
  //     .select({
  //       id: p.id,
  //       conversationId: p.conversationId,
  //       userId: p.userId,
  //       role: p.role,
  //       lastReadMessageId: p.lastReadMessageId,
  //       lastReadAt: p.lastReadAt,
  //       unreadCount: p.unreadCount,
  //       // user: {
  //       //   id: u.id,
  //       //   type: u.type,
  //       //   username: u.username,
  //       //   email: u.email,
  //       //   age: u.age,
  //       //   gender: u.gender,
  //       //   country: u.country,
  //       //   bio: u.bio,
  //       //   lastSeenAt: u.lastSeenAt
  //       // }
  //     })
  //     .from(p)
  //     .where(inArray(participants.conversationId, conversationIds))
  //     .leftJoin(u, eq(p.userId, u.id))
  // },

  selectManyByConvIds: async ({ conversationIds }: { conversationIds: number[] }) => {
    const p = participants;
    return await db
      .select({
        id: p.id,
        conversationId: p.conversationId,
        userId: p.userId,
        role: p.role,
        lastReadMessageId: p.lastReadMessageId,
        lastReadAt: p.lastReadAt,
        lastDeliveredAt: p.lastDeliveredAt,
        lastDeliveredMessageId: p.lastDeliveredMessageId,
        unreadCount: p.unreadCount,
      })
      .from(p)
      .where(inArray(participants.conversationId, conversationIds))
  },


  selectManyParticipantsByManyConversationIds: async ({ conversationIds, tx = db }: { conversationIds: number[], tx?: DB_TX }) => {
    return await tx
      .select({
        participantId: participants.id,
        conversationId: participants.conversationId,
        userId: participants.userId,
        unreadCount: participants.unreadCount,
        role: participants.role,
        joinedAt: participants.joinedAt,
        leftAt: participants.leftAt,
        isActive: participants.isActive,
        username: users.username,
        gender: users.gender,
        age: users.age,
        country: users.country,
        bio: users.bio,
      })
      .from(participants)
      .innerJoin(users, eq(participants.userId, users.id))
      .where(
        and(
          inArray(participants.conversationId, conversationIds),
          eq(participants.isDeleted, false)
        )
      )
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
        conversationType: conversations.type,
      })
      .from(p1)
      .innerJoin(p2, eq(p1.conversationId, p2.conversationId))
      .innerJoin(
        conversations,
        eq(p1.conversationId, conversations.id),
      )
      .where(
        and(
          eq(p1.userId, userId),
          eq(p2.userId, otherUserId),
          eq(conversations.type, "direct"),
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
    readerId,
    conversationId,
    messageId,
  }: {
    readerId: number;
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
          eq(participants.userId, readerId),
          eq(participants.conversationId, conversationId),
        ),
      );
  },
};
