import { eq, and, ne, inArray } from "drizzle-orm";
import db from "../../../../core/db/client";
import { message_receipts } from "../../../../core/db/schema";
import { NewMessageReceipt } from "@chat/shared/src/lib/utils/validation";


export const insertMessageReceipt = async ({
  message_id,
  user_id,
  status,
}: {
  message_id: number,
  user_id: number,
  status: "sent" | "delivered" | "read",
}) => {
  return await db
    .insert(message_receipts)
    .values({
      message_id,
      user_id,
      status,
    })
    .returning();
}

export const updateMessageReceipt = async ({
  receipt_id,
  status,
  delivered_at,
  read_at,
}: {
  receipt_id: number,
  status: "sent" | "delivered" | "read",
  delivered_at: Date,
  read_at: Date,
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
}



export const selectReceiptsForMessage = async (message_id: number) => {
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
}


export const selectUnreadMessagesForUser = async (user_id: number) => {
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
        ne(message_receipts.status, "read")
      )
    );
}


export const insertBulkMessageReceipts = async (messageReceipts: NewMessageReceipt[]) => {
  return await db
    .insert(message_receipts)
    .values(messageReceipts)
    .returning();
}

export async function updateBulkMessageReceiptsToRead({
  userId,
  messageIds,
  readAt,
}: {
  userId: number,
  messageIds: number[],
  readAt: Date,
}) {
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
        eq(message_receipts.status, "delivered")
      )
    );
}


export async function updateBulkMessageReceiptsToDelivered({
  userId,
  messageIds,
  deliveredAt,
}: {
  userId: number,
  messageIds: number[],
  deliveredAt: Date,
}) {
  if (messageIds.length === 0) return;

  await db
    .update(message_receipts)
    .set({
      status: 'delivered',
      delivered_at: deliveredAt,
      updated_at: new Date(Date.now()),
    })
    .where(
      and(
        eq(message_receipts.user_id, userId),
        inArray(message_receipts.message_id, messageIds),
        eq(message_receipts.status, "sent")
      )
    );
}
