import { message_receipts } from "@pingxy/shared";
import type { InsertReceiptType } from "@pingxy/shared/domain/message-receipt/message-receipt.types";
import { and, eq, inArray, isNull, ne } from "drizzle-orm";
import db from "src/common/db/client";

export const ReceiptRepository = {
  insertMessageReceipt: async ({
    conversation_id,
    message_id,
    user_id,
    status,
  }: {
    conversation_id: number;
    message_id: number;
    user_id: number;
    status: "sent" | "delivered" | "read";
  }) => {
    return await db
      .insert(message_receipts)
      .values({
        conversation_id,
        message_id,
        user_id,
        status,
      })
      .returning();
  },

  updateMessageReceipt: async ({
    receipt_id,
    status,
    delivered_at,
    read_at,
  }: {
    receipt_id: number;
    status: "sent" | "delivered" | "read";
    delivered_at: Date;
    read_at: Date;
  }) => {
    return await db
      .update(message_receipts)
      .set({
        status,
        delivered_at,
        read_at,
      })
      .where(eq(message_receipts.receipt_id, receipt_id))
      .returning();
  },

  selectReceiptsForMessage: async (message_id: number) => {
    return await db
      .select({
        receipt_id: message_receipts.receipt_id,
        message_id: message_receipts.message_id,
        user_id: message_receipts.user_id,
        status: message_receipts.status,
        delivered_at: message_receipts.delivered_at,
        read_at: message_receipts.read_at,
        created_at: message_receipts.created_at,
        updated_at: message_receipts.updated_at,
      })
      .from(message_receipts)
      .where(eq(message_receipts.message_id, message_id));
  },

  selectUnreadMessagesForUser: async (user_id: number) => {
    return await db
      .select({
        message_id: message_receipts.message_id,
        user_id: message_receipts.user_id,
        status: message_receipts.status,
        delivered_at: message_receipts.delivered_at,
        read_at: message_receipts.read_at,
        created_at: message_receipts.created_at,
        updated_at: message_receipts.updated_at,
      })
      .from(message_receipts)
      .where(
        and(
          eq(message_receipts.user_id, user_id),
          ne(message_receipts.status, "read"),
        ),
      );
  },

  insertBulkMessageReceipts: async (
    messageReceipts: InsertReceiptType,
  ) => {
    return await db
      .insert(message_receipts)
      .values(messageReceipts)
      .returning();
  },

  updateAllMessageReceiptsToRead: async ({
    conversation_id,
    user_id,
  }: {
    conversation_id: number;
    user_id: number;
  }) => {
    return await db
      .update(message_receipts)
      .set({
        status: "read",
        read_at: new Date(Date.now()),
        updated_at: new Date(Date.now()),
      })
      .where(
        and(
          eq(message_receipts.conversation_id, conversation_id),
          eq(message_receipts.user_id, user_id),
          ne(message_receipts.status, "read"),
          isNull(message_receipts.read_at),
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
      .update(message_receipts)
      .set({
        status: "read",
        read_at: readAt,
        updated_at: new Date(Date.now()),
      })
      .where(
        and(
          eq(message_receipts.user_id, userId),
          inArray(message_receipts.message_id, messageIds),
          eq(message_receipts.status, "delivered"),
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
      .update(message_receipts)
      .set({
        status: "delivered",
        delivered_at: deliveredAt,
        updated_at: new Date(Date.now()),
      })
      .where(
        and(
          eq(message_receipts.user_id, userId),
          inArray(message_receipts.message_id, messageIds),
          eq(message_receipts.status, "sent"),
        ),
      );
  },

  updateMessageReceiptToDelivered: async ({
    message_id,
    user_id,
  }: {
    message_id: number;
    user_id: number;
  }) => {
    return await db
      .update(message_receipts)
      .set({
        status: "delivered",
        delivered_at: new Date(Date.now()),
        updated_at: new Date(Date.now()),
      })
      .where(
        and(
          eq(message_receipts.message_id, message_id),
          eq(message_receipts.user_id, user_id),
          eq(message_receipts.status, "sent"),
        ),
      )
      .returning();
  },

  updateMessageReceiptToRead: async ({
    message_id,
    user_id,
  }: {
    message_id: number;
    user_id: number;
  }) => {
    return await db
      .update(message_receipts)
      .set({
        status: "read",
        read_at: new Date(Date.now()),
        updated_at: new Date(Date.now()),
      })
      .where(
        and(
          eq(message_receipts.message_id, message_id),
          eq(message_receipts.user_id, user_id),
          inArray(message_receipts.status, ["sent", "delivered"]),
          // eq(message_receipts.status, "delivered")
        ),
      )
      .returning();
  },

  updateMessageReceiptToSent: async ({
    message_id,
    user_id,
  }: {
    message_id: number;
    user_id: number;
  }) => {
    return await db
      .update(message_receipts)
      .set({
        status: "sent",
        updated_at: new Date(Date.now()),
      })
      .where(
        and(
          eq(message_receipts.message_id, message_id),
          eq(message_receipts.user_id, user_id),
          eq(message_receipts.status, "read"),
        ),
      );
  },
};
