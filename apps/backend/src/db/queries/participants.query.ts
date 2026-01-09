import { aliasedTable, and, eq } from "drizzle-orm";
import db from "../client";
import { conversations, participants } from "../schema/index";

import { NewParticipant } from "@chat/shared/src/lib/utils/validation";
import { BunSQLDatabase } from "drizzle-orm/bun-sql";
import { PgTransaction } from "drizzle-orm/pg-core";

export const insertParticipant = async (
  participant: NewParticipant,
  tx: BunSQLDatabase | PgTransaction<any, any, any> = db
) => {
  return await tx
    .insert(participants)
    .values({
      conversation_id: participant.conversation_id,
      user_id: participant.user_id,
      role: participant.role,
      joined_at: participant.joined_at,
      left_at: participant.left_at,
      is_active: participant.is_active,
    })
    .onConflictDoUpdate({
      target: [participants.conversation_id, participants.user_id],
      set: {
        left_at: null,
        is_active: true,
      },
    })
    .returning();
};


export const selectParticipant = async (
  conversationId: number,
  userId: number
) => {
  return await db
    .select()
    .from(participants)
    .where(
      and(
        eq(participants.conversation_id, conversationId),
        eq(participants.user_id, userId)
      )
    )
    .limit(1);
};

export const selectParticipantById = async (participantId: number) => {
  return await db
    .select()
    .from(participants)
    .where(eq(participants.participant_id, participantId))
    .limit(1);
};

export const selectParticipantsByConversationId = async (
  conversationId: number
) => {
  return await db
    .select()
    .from(participants)
    .where(eq(participants.conversation_id, conversationId));
};

export const updateParticipantRole = async (
  conversationId: number,
  userId: number,
  role: "admin" | "moderator" | "member"
) => {
  return await db
    .update(participants)
    .set({ role })
    .where(
      and(
        eq(participants.conversation_id, conversationId),
        eq(participants.user_id, userId)
      )
    )
    .returning();
};

export const deleteParticipant = async (
  conversationId: number,
  userId: number
) => {
  return await db
    .delete(participants)
    .where(
      and(
        eq(participants.conversation_id, conversationId),
        eq(participants.user_id, userId)
      )
    )
    .returning();
};

export const selectActiveParticipants = async (conversationId: number) => {
  return await db
    .select()
    .from(participants)
    .where(
      and(
        eq(participants.conversation_id, conversationId),
        eq(participants.is_active, true)
      )
    );
};

export const selectIsUserInConversation = async (
  conversationId: number,
  userId: number
) => {
  return await db
    .select()
    .from(participants)
    .where(
      and(
        eq(participants.conversation_id, conversationId),
        eq(participants.user_id, userId)
      )
    )
    .limit(1);
};

export const selectDirectMessageConversationId = async (
  userId: number,
  otherUserId: number
) => {
  const p1 = aliasedTable(participants, "p1");
  const p2 = aliasedTable(participants, "p2");

  return await db
    .select({
      conversation_id: p1.conversation_id,
      conversation_type: conversations.conversation_type,
    })
    .from(p1)
    .innerJoin(p2, eq(p1.conversation_id, p2.conversation_id))
    .innerJoin(
      conversations,
      eq(p1.conversation_id, conversations.conversation_id)
    )
    .where(
      and(
        eq(p1.user_id, userId),
        eq(p2.user_id, otherUserId),
        eq(conversations.conversation_type, "direct")
      )
    )
    .limit(1);
};
