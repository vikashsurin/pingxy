import { and, desc, eq, ne, lt, gt, asc } from "drizzle-orm";
import db from "src/common/db/client";
import { messages, message_receipts } from "@pingxy/shared";
import { type DB_TX } from "src/common/db/client";
import { InsertMessageType, UpdateMessageType } from "@pingxy/shared/domain";


export const MessageRepository = {
  insertMessage: async (
    message: InsertMessageType,
    tx: DB_TX = db,
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
  },

  updateMessage: async (message_id: number, message: Partial<UpdateMessageType>) => {
    return db
      .update(messages)
      .set({
        content: message.content,
        updated_at: message.updated_at,
      })
      .where(eq(messages.message_id, message_id))
      .returning();
  },

  deleteMessage: async (message_id: number) => {
    return db
      .delete(messages)
      .where(eq(messages.message_id, message_id))
      .returning();
  },

  selectMessageById: async (message_id: number) => {
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
  },

  // Select all messages of a conversation
  selectMessagesByConversationId: async (conversation_id: number, tx: DB_TX = db) => {
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
  },

  // selectMessagesAndReceiptsByConversation = async ({
  //   conversation_id,
  //   user_id,
  //   limit,
  //   tx = db,
  // }: {
  //   conversation_id: number;
  //   user_id: number;
  //   limit: number;
  //   tx: BunSQLDatabase | PgTransaction<any, any, any>;
  // }) => {
  //   const result = await tx
  //     .select({
  //       message: messages,
  //       receipt: message_receipts,
  //     })
  //     .from(messages)
  //     .where(eq(messages.conversation_id, conversation_id))
  //     .leftJoin(
  //       message_receipts,
  //       and(
  //         eq(messages.message_id, message_receipts.message_id),
  //         ne(message_receipts.user_id, user_id)
  //       )
  //     )
  //     .limit(limit)
  //     .orderBy(desc(messages.created_at));
  //   return result;
  // },

  selectMessagesAndReceiptsByConversationForGroup: async ({
    conversation_id,
    user_id,
    tx = db,
  }: {
    conversation_id: number;
    user_id: number;
    tx: DB_TX;
  }) => {
    const result = await tx
      .select({
        message: messages,
        receipt: message_receipts,
      })
      .from(messages)
      .where(eq(messages.conversation_id, conversation_id))
      .leftJoin(
        message_receipts,
        eq(messages.message_id, message_receipts.message_id),
        // No user_id filter - get ALL receipts
      )
      .orderBy(desc(messages.created_at));
    return result;
  },

  // Select all messages of a sender
  selectMessagesBySenderId: async (sender_id: number) => {
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
  },

  selectMessagesAndReceiptsByConversation: async ({
    conversation_id,
    user_id,
    before,
    after,
    limit,
    tx = db,
  }: {
    conversation_id: number;
    user_id: number;
    before: number | null;
    after: number | null;
    limit: number;
    tx: DB_TX;
  }) => {
    // Base condition: always filter by conversation
    const baseCondition = eq(messages.conversation_id, conversation_id);

    // Build query based on pagination direction
    let query = tx
      .select({ message: messages, receipt: message_receipts })
      .from(messages)
      .leftJoin(
        message_receipts,
        and(
          eq(messages.message_id, message_receipts.message_id),
          ne(message_receipts.user_id, user_id),
        ),
      );

    if (before) {
      // Get messages OLDER than 'before'
      const result = await query
        .where(and(baseCondition, lt(messages.message_id, before)))
        .orderBy(desc(messages.message_id))
        .limit(limit);

      return result.reverse(); // Reverse to chronological order
    } else if (after) {
      // Get messages NEWER than 'after'
      return await query
        .where(and(baseCondition, gt(messages.message_id, after)))
        .orderBy(asc(messages.message_id))
        .limit(limit);
    } else {
      // Initial load: get latest messages
      const result = await query
        .where(baseCondition)
        .orderBy(desc(messages.message_id))
        .limit(limit);

      return result.reverse(); // Reverse to chronological order
    }
  },
};
