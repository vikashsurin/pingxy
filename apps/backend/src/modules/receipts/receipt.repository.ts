import { messageReceipts } from "@pingxy/shared";
import type { InsertReceiptType } from "@pingxy/shared/domain/message-receipt/message-receipt.types";
import { and, eq, inArray, isNull, ne, sql } from "drizzle-orm";
import db from "src/common/db/client";

export const ReceiptRepository = {
  insertMessageReceipt: async ({
    conversationId,
    messageId,
    userId,
    status,
  }: {
    conversationId: number;
    messageId: number;
    userId: number;
    status: "sent" | "delivered" | "read";
  }) => {
    return await db
      .insert(messageReceipts)
      .values({
        conversationId,
        messageId,
        userId,
        status,
      })
      .returning();
  },

  updateMessageReceipt: async ({
    receiptId,
    status,
    deliveredAt,
    readAt,
  }: {
    receiptId: number;
    status: "sent" | "delivered" | "read";
    deliveredAt: Date;
    readAt: Date;
  }) => {
    return await db
      .update(messageReceipts)
      .set({
        status,
        deliveredAt,
        readAt,
      })
      .where(eq(messageReceipts.receiptId, receiptId))
      .returning();
  },

  selectReceiptsForMessage: async (messageId: number) => {
    return await db
      .select({
        receiptId: messageReceipts.receiptId,
        messageId: messageReceipts.messageId,
        userId: messageReceipts.userId,
        status: messageReceipts.status,
        deliveredAt: messageReceipts.deliveredAt,
        readAt: messageReceipts.readAt,
        createdAt: messageReceipts.createdAt,
        updatedAt: messageReceipts.updatedAt,
      })
      .from(messageReceipts)
      .where(eq(messageReceipts.messageId, messageId));
  },

  selectUnreadMessagesForUser: async (userId: number) => {
    return await db
      .select({
        messageId: messageReceipts.messageId,
        userId: messageReceipts.userId,
        status: messageReceipts.status,
        deliveredAt: messageReceipts.deliveredAt,
        readAt: messageReceipts.readAt,
        createdAt: messageReceipts.createdAt,
        updatedAt: messageReceipts.updatedAt,
      })
      .from(messageReceipts)
      .where(
        and(
          eq(messageReceipts.userId, userId),
          ne(messageReceipts.status, "read"),
        ),
      );
  },

  insertBulkMessageReceipts: async (receipts: InsertReceiptType) => {
    return await db.insert(messageReceipts).values(receipts).returning();
  },

  updateAllMessageReceiptsToRead: async ({
    conversationId,
    userId,
  }: {
    conversationId: number;
    userId: number;
  }) => {
    return await db
      .update(messageReceipts)
      .set({
        status: "read",
        readAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      })
      .where(
        and(
          eq(messageReceipts.conversationId, conversationId),
          eq(messageReceipts.userId, userId),
          ne(messageReceipts.status, "read"),
          isNull(messageReceipts.readAt),
        ),
      )
      .returning();
  },

  updateBulkMessageReceiptsToRead: async ({
    userId,
    messageIds,
    readAt,
  }: {
    userId: number;
    messageIds: number[];
    readAt: Date;
  }) => {
    if (messageIds.length === 0) return;

    await db
      .update(messageReceipts)
      .set({
        status: "read",
        readAt: readAt,
        updatedAt: new Date(Date.now()),
      })
      .where(
        and(
          eq(messageReceipts.userId, userId),
          inArray(messageReceipts.messageId, messageIds),
          eq(messageReceipts.status, "delivered"),
        ),
      );
  },

  updateBulkMessageReceiptsToDelivered: async ({
    userId,
    messageIds,
    deliveredAt,
  }: {
    userId: number;
    messageIds: number[];
    deliveredAt: Date;
  }) => {
    if (messageIds.length === 0) return;

    await db
      .update(messageReceipts)
      .set({
        status: "delivered",
        deliveredAt: deliveredAt,
        updatedAt: new Date(Date.now()),
      })
      .where(
        and(
          eq(messageReceipts.userId, userId),
          inArray(messageReceipts.messageId, messageIds),
          eq(messageReceipts.status, "sent"),
        ),
      );
  },

  updateMessageReceiptToDelivered: async ({
    messageId,
    userId,
  }: {
    messageId: number;
    userId: number;
  }) => {
    return await db
      .update(messageReceipts)
      .set({
        status: "delivered",
        deliveredAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      })
      .where(
        and(
          eq(messageReceipts.messageId, messageId),
          eq(messageReceipts.userId, userId),
          eq(messageReceipts.status, "sent"),
        ),
      )
      .returning();
  },

  updateMessageReceiptToRead: async ({
    messageId,
    userId,
  }: {
    messageId: number;
    userId: number;
  }) => {
    const now = new Date(Date.now());
    return await db
      .update(messageReceipts)
      .set({
        status: "read",
        readAt: now,
        updatedAt: now,
        deliveredAt: sql`COALESCE(${messageReceipts.deliveredAt}, ${now})`,
      })
      .where(
        and(
          eq(messageReceipts.messageId, messageId),
          eq(messageReceipts.userId, userId),
          inArray(messageReceipts.status, ["sent", "delivered"]),
        ),
      )
      .returning();
  },

  updateMessageReceiptToSent: async ({
    messageId,
    userId,
  }: {
    messageId: number;
    userId: number;
  }) => {
    return await db
      .update(messageReceipts)
      .set({
        status: "sent",
        updatedAt: new Date(Date.now()),
      })
      .where(
        and(
          eq(messageReceipts.messageId, messageId),
          eq(messageReceipts.userId, userId),
          eq(messageReceipts.status, "read"),
        ),
      );
  },
};
