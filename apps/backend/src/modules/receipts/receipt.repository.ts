import { messageReceipts } from "@pingxy/shared";
import type { InsertReceiptType } from "@pingxy/shared/domain/message-receipt/message-receipt.types";
import { and, count, eq, inArray, isNull, ne, sql } from "drizzle-orm";
import db from "@lib/db/client";

export const ReceiptRepository = {
  insertMessageReceipt: async ({
    conversationId,
    messageId,
    readerId,
    status,
  }: {
    conversationId: number;
    messageId: number;
    readerId: number;
    status: "sent" | "delivered" | "read";
  }) => {
    return await db
      .insert(messageReceipts)
      .values({
        conversationId,
        messageId,
        readerId,
        status,
      })
      .returning();
  },

  updateMessageReceipt: async ({
    id,
    status,
    deliveredAt,
    readAt,
  }: {
    id: number;
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
      .where(eq(messageReceipts.id, id))
      .returning();
  },

  selectReceiptsForMessage: async (messageId: number) => {
    return await db
      .select({
        id: messageReceipts.id,
        messageId: messageReceipts.messageId,
        readerId: messageReceipts.readerId,
        status: messageReceipts.status,
        deliveredAt: messageReceipts.deliveredAt,
        readAt: messageReceipts.readAt,
        createdAt: messageReceipts.createdAt,
        updatedAt: messageReceipts.updatedAt,
      })
      .from(messageReceipts)
      .where(eq(messageReceipts.messageId, messageId));
  },

  selectUnreadMessagesForUser: async (readerId: number) => {
    return await db
      .select({
        messageId: messageReceipts.messageId,
        readerId: messageReceipts.readerId,
        status: messageReceipts.status,
        deliveredAt: messageReceipts.deliveredAt,
        readAt: messageReceipts.readAt,
        createdAt: messageReceipts.createdAt,
        updatedAt: messageReceipts.updatedAt,
      })
      .from(messageReceipts)
      .where(
        and(
          eq(messageReceipts.readerId, readerId),
          ne(messageReceipts.status, "read"),
        ),
      );
  },

  insertBulkMessageReceipts: async (receipts: InsertReceiptType) => {
    return await db.insert(messageReceipts).values(receipts).returning();
  },

  updateAllMessageReceiptsToRead: async ({
    conversationId,
    readerId,
  }: {
    conversationId: number;
    readerId: number;
  }) => {
    const now = new Date();
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
          eq(messageReceipts.conversationId, conversationId),
          eq(messageReceipts.readerId, readerId),
          ne(messageReceipts.status, "read"),
        ),
      )
      .returning();
  },

  updateBulkMessageReceiptsToRead: async ({
    readerId,
    messageIds,
    readAt,
  }: {
    readerId: number;
    messageIds: number[];
    readAt: Date;
  }) => {
    if (messageIds.length === 0) return;
    const now = new Date(Date.now());

    await db
      .update(messageReceipts)
      .set({
        status: "read",
        readAt: readAt,
        updatedAt: new Date(Date.now()),
        deliveredAt: sql`COALESCE(${messageReceipts.deliveredAt}, ${now})`,
      })
      .where(
        and(
          eq(messageReceipts.readerId, readerId),
          inArray(messageReceipts.messageId, messageIds),
          eq(messageReceipts.status, "delivered"),
        ),
      );
  },

  updateBulkMessageReceiptsToDelivered: async ({
    readerId,
    messageIds,
    deliveredAt,
  }: {
    readerId: number;
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
          eq(messageReceipts.readerId, readerId),
          inArray(messageReceipts.messageId, messageIds),
          eq(messageReceipts.status, "sent"),
        ),
      );
  },

  updateMessageReceiptToDelivered: async ({
    messageId,
    readerId,
  }: {
    messageId: number;
    readerId: number;
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
          eq(messageReceipts.readerId, readerId),
          eq(messageReceipts.status, "sent"),
        ),
      )
      .returning();
  },

  updateMessageReceiptToRead: async ({
    messageId,
    readerId,
  }: {
    messageId: number;
    readerId: number;
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
          eq(messageReceipts.readerId, readerId),
          inArray(messageReceipts.status, ["sent", "delivered"]),
        ),
      )
      .returning();
  },

  updateMessageReceiptToSent: async ({
    messageId,
    readerId,
  }: {
    messageId: number;
    readerId: number;
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
          eq(messageReceipts.readerId, readerId),
          eq(messageReceipts.status, "read"),
        ),
      );
  },

  selectUnreadCountForUser: async (readerId: number) => {
    return await db
      .select({
        count: count(),
        conversationId: messageReceipts.conversationId,
      })
      .from(messageReceipts)
      .where(
        and(
          eq(messageReceipts.readerId, readerId),
          ne(messageReceipts.status, "read"),
        ),
      )
      .groupBy(messageReceipts.conversationId);
  },
};
