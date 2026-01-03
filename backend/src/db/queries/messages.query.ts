import { eq } from "drizzle-orm";
import db from "../client";
import { messages, NewMessage } from "../schema";

export const insertMessage = (
  message: NewMessage) => {
  return db
    .insert(messages)
    .values({
      conversation_id: message.conversation_id,
      sender_id: message.sender_id,
      content: message.content,
      created_at: message.created_at,
      updated_at: message.updated_at,
      deleted_at: message.deleted_at,
    }).returning();
}

export const updateMessage = (
  message_id: number,
  message: Partial<NewMessage>) => {
  return db
    .update(messages)
    .set({
      conversation_id: message.conversation_id,
      sender_id: message.sender_id,
      content: message.content,
      updated_at: message.updated_at,
      deleted_at: message.deleted_at,
    })
    .where(eq(messages.message_id, message_id))
    .returning();
}

export const deleteMessage = (message_id: number) => {
  return db
    .delete(messages)
    .where(eq(messages.message_id, message_id))
    .returning();
}


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
}

export const selectMessagesByConversationId = (conversation_id: number) => {
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
    .where(eq(messages.conversation_id, conversation_id));
}

export const selectMessagesBySenderId = (sender_id: string) => {
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
}