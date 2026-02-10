import { messageReceipts, messages } from "@pingxy/shared";
import { DbInsertMessageType, UpdateMessageType } from "@pingxy/shared/domain";
import { and, asc, desc, eq, gt, lt, ne } from "drizzle-orm";
import db, { type DB_TX } from "src/common/db/client";

export const MessageRepository = {
  insertMessage: async (message: DbInsertMessageType, tx: DB_TX = db) => {
    return tx
      .insert(messages)
      .values({
        conversationId: message.conversationId,
        clientMessageId: message.clientMessageId,
        senderId: message.senderId,
        content: message.content,
      })
      .returning();
  },

  updateMessage: async (
    messageId: number,
    message: Partial<UpdateMessageType>,
    tx: DB_TX = db,
  ) => {
    return tx
      .update(messages)
      .set({
        content: message.content,
        updatedAt: message.updatedAt,
      })
      .where(eq(messages.messageId, messageId))
      .returning();
  },

  deleteMessage: async (messageId: number) => {
    return db
      .delete(messages)
      .where(eq(messages.messageId, messageId))
      .returning();
  },

  selectMessageById: async (messageId: number, tx: DB_TX = db) => {
    return tx
      .select({
        messageId: messages.messageId,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        content: messages.content,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        deletedAt: messages.deletedAt,
      })
      .from(messages)
      .where(eq(messages.messageId, messageId));
  },

  // Select all messages of a conversation
  selectMessagesByConversationId: async (
    conversationId: number,
    tx: DB_TX = db,
  ) => {
    return tx
      .select({
        messageId: messages.messageId,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        content: messages.content,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        deletedAt: messages.deletedAt,
      })
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(50);
  },

  // selectMessagesAndReceiptsByConversation = async ({
  //   conversationId,
  //   userId,
  //   limit,
  //   tx = db,
  // }: {
  //   conversationId: number;
  //   userId: number;
  //   limit: number;
  //   tx: BunSQLDatabase | PgTransaction<any, any, any>;
  // }) => {
  //   const result = await tx
  //     .select({
  //       message: messages,
  //       receipt: messageReceipts,
  //     })
  //     .from(messages)
  //     .where(eq(messages.conversationId, conversationId))
  //     .leftJoin(
  //       messageReceipts,
  //       and(
  //         eq(messages.messageId, messageReceipts.messageId),
  //         ne(messageReceipts.userId, userId)
  //       )
  //     )
  //     .limit(limit)
  //     .orderBy(desc(messages.createdAt));
  //   return result;
  // },

  selectMessagesAndReceiptsByConversationForGroup: async ({
    conversationId,
    tx = db,
  }: {
    conversationId: number;
    userId: number;
    tx: DB_TX;
  }) => {
    const result = await tx
      .select({
        message: messages,
        receipt: messageReceipts,
      })
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .leftJoin(
        messageReceipts,
        eq(messages.messageId, messageReceipts.messageId),
        // No userId filter - get ALL receipts
      )
      .orderBy(desc(messages.createdAt));
    return result;
  },

  // Select all messages of a sender
  selectMessagesBySenderId: async (senderId: number, tx: DB_TX = db) => {
    return tx
      .select({
        messageId: messages.messageId,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        content: messages.content,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        deletedAt: messages.deletedAt,
      })
      .from(messages)
      .where(eq(messages.senderId, senderId));
  },

  selectMessagesAndReceiptsByConversation: async ({
    conversationId,
    userId,
    before,
    after,
    limit,
    tx = db,
  }: {
    conversationId: number;
    userId: number;
    before: number | null;
    after: number | null;
    limit: number;
    tx: DB_TX;
  }) => {
    // Base condition: always filter by conversation
    const baseCondition = eq(messages.conversationId, conversationId);

    // Build query based on pagination direction
    let query = tx
      .select({ message: messages, receipt: messageReceipts })
      .from(messages)
      .leftJoin(
        messageReceipts,
        and(
          eq(messages.messageId, messageReceipts.messageId),
          ne(messageReceipts.userId, userId),
        ),
      );

    if (before) {
      // Get messages OLDER than 'before'
      const result = await query
        .where(and(baseCondition, lt(messages.messageId, before)))
        .orderBy(desc(messages.messageId))
        .limit(limit);

      return result.reverse(); // Reverse to chronological order
    } else if (after) {
      // Get messages NEWER than 'after'
      return await query
        .where(and(baseCondition, gt(messages.messageId, after)))
        .orderBy(asc(messages.messageId))
        .limit(limit);
    } else {
      // Initial load: get latest messages
      const result = await query
        .where(baseCondition)
        .orderBy(desc(messages.messageId))
        .limit(limit);

      return result.reverse(); // Reverse to chronological order
    }
  },

  selectLatestMessageByConversationId: async (
    conversationId: number,
    tx: DB_TX = db,
  ) => {
    return tx
      .select({ message: messages })
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.messageId))
      .limit(1);
  },
};
