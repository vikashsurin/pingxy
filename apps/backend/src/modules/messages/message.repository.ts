import { messageReceipts, messages } from "@pingxy/shared";
import {
  attachments,
  DbInsertMessageType,
  UpdateMessageType,
} from "@pingxy/shared/domain";
import { and, asc, desc, eq, gt, gte, lt, lte, ne } from "drizzle-orm";
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
        attachments: message.attachments,
      })
      .returning({
        messageId: messages.messageId,
        conversationId: messages.conversationId,
        clientMessageId: messages.clientMessageId,
        senderId: messages.senderId,
        content: messages.content,
        createdAt: messages.createdAt,
      });
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

  // Select all messages of a conversation
  selectMessages: async ({
    conversationId,
    userId,
    before,
    after,
    limit,
    tx = db,
  }: {
    conversationId: number;
    userId: number;
    before?: number | null;
    after?: number | null;
    limit: number;
    tx?: DB_TX;
  }) => {
    // 1. Create a subquery to get ONLY the message IDs we need.
    // This is extremely fast with a (conversationId, messageId) index.
    const messageIdsProvider = tx
      .select({ id: messages.messageId })
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, conversationId),
          // Use strict null/undefined checks to avoid '0' falsy bugs
          before != null ? lte(messages.messageId, before) : undefined,
          after != null ? gte(messages.messageId, after) : undefined,
        ),
      )
      // If 'after' is provided, we fetch 'asc' to get the next page.
      // Otherwise 'desc' to get the latest/previous page.
      .orderBy(
        after != null ? asc(messages.messageId) : desc(messages.messageId),
      )
      .limit(limit)
      .as("message_ids_provider");

    // 2. Join the actual data only against those specific IDs.
    const rows = await tx
      .select({
        message: {
          messageId: messages.messageId,
          conversationId: messages.conversationId,
          clientMessageId: messages.clientMessageId,
          senderId: messages.senderId,
          content: messages.content,
          createdAt: messages.createdAt,
        },
        receipt: messageReceipts,
        attachment: attachments,
      })
      .from(messages)
      .innerJoin(
        messageIdsProvider,
        eq(messages.messageId, messageIdsProvider.id),
      )
      .leftJoin(
        messageReceipts,
        and(
          eq(messages.messageId, messageReceipts.messageId),
          eq(messageReceipts.conversationId, conversationId),
          ne(messageReceipts.readerId, userId),
        ),
      )
      .leftJoin(
        attachments,
        and(
          eq(messages.messageId, attachments.messageId),
          eq(attachments.conversationId, conversationId),
        ),
      )
      .orderBy(asc(messages.messageId));

    return rows;
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
