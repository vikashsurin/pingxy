import { NewMessage } from "@chat/shared/src/lib/utils/validation";
import { desc, eq } from "drizzle-orm";
import { type BunSQLDatabase } from "drizzle-orm/bun-sql";
import { type PgTransaction } from "drizzle-orm/pg-core";
import db from "../client";
import { messages } from "../schema/index";

export const insertMessage = (
  message: NewMessage,
  tx: BunSQLDatabase | PgTransaction<any, any, any> = db
) => {
  return tx
    .insert(messages)
    .values({
      conversation_id: message.conversation_id,
      client_message_id: message.client_message_id,
      sender_id: message.sender_id,
      content: message.content,
    })
    .returning();
};

export const updateMessage = (
  message_id: number,
  message: Partial<NewMessage>
) => {
  return db
    .update(messages)
    .set({
      content: message.content,
      updated_at: message.updated_at,
    })
    .where(eq(messages.message_id, message_id))
    .returning();
};

export const deleteMessage = (message_id: number) => {
  return db
    .delete(messages)
    .where(eq(messages.message_id, message_id))
    .returning();
};

export const selectMessageById = (message_id: number) => {
  return db
    .select({
      message_id: messages.message_id,
      conversation_id: messages.conversation_id,
      sender_id: messages.sender_id,
      content: messages.content,
      created_at: messages.created_at,
      updated_at: messages.updated_at,
      deleted_at: messages.deleted_at,
    })
    .from(messages)
    .where(eq(messages.message_id, message_id));
};

// Select all messages of a conversation
export const selectMessagesByConversationId = (
  conversation_id: number,
  tx = db
) => {
  return tx
    .select({
      message_id: messages.message_id,
      conversation_id: messages.conversation_id,
      sender_id: messages.sender_id,
      content: messages.content,
      created_at: messages.created_at,
      updated_at: messages.updated_at,
      deleted_at: messages.deleted_at,
    })
    .from(messages)
    .where(eq(messages.conversation_id, conversation_id))
    .orderBy(desc(messages.created_at))
    .limit(50);
};

// Select all messages of a sender
export const selectMessagesBySenderId = (sender_id: number) => {
  return db
    .select({
      message_id: messages.message_id,
      conversation_id: messages.conversation_id,
      sender_id: messages.sender_id,
      content: messages.content,
      created_at: messages.created_at,
      updated_at: messages.updated_at,
      deleted_at: messages.deleted_at,
    })
    .from(messages)
    .where(eq(messages.sender_id, sender_id));
};
