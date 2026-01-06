import { type BunSQLDatabase } from 'drizzle-orm/bun-sql';
import { type PgTransaction } from 'drizzle-orm/pg-core';
import db from "../client";
import { conversations, participants } from "../schema/index";
import { eq, and, countDistinct } from "drizzle-orm";
import { type NewConversation } from "@chat/shared/src/lib/utils/validation";
import { alias } from "drizzle-orm/pg-core";



export const insertConversation = async (
  conversation: NewConversation,
  tx: BunSQLDatabase | PgTransaction<any, any, any> = db) => {
  return await tx
    .insert(conversations)
    .values(conversation)
    .returning();
};


export const selectConversationById = async (id: number) => {
  return await db
    .select()
    .from(conversations)
    .where(eq(conversations.conversation_id, id))
    .limit(1);
};

export const selectExistingDirectConversation = async (
  user_id_1: number,
  user_id_2: number,
  tx: any = db
) => {

  const p1 = alias(participants, 'p1')
  const p2 = alias(participants, 'p2')

  return await tx.select({
    conversation_id: conversations.conversation_id,
    conversation_type: conversations.conversation_type
  })
    .from(conversations)
    .innerJoin(p1,
      eq(conversations.conversation_id, p1.conversation_id))
    .innerJoin(p2,
      eq(conversations.conversation_id, p2.conversation_id))
    .where(
      and(
        eq(p1.user_id, user_id_1),
        eq(p2.user_id, user_id_2),
        eq(conversations.conversation_type, 'direct'),
        // eq(conversations.isDeleted, false),
      )
    ).groupBy(conversations.conversation_id)
    .having(eq(countDistinct(p1.user_id), 2));

}

export const selectConversationByAuthorId = async (authorId: number) => {
  return await db
    .select()
    .from(conversations)
    .where(eq(conversations.created_by, authorId))
    .limit(1);
};

export const deleteConversation = async (id: number) => {
  return await db
    .delete(conversations)
    .where(eq(conversations.conversation_id, id))
    .returning();
};
