import { describe, test, expect, beforeAll } from "bun:test";
import { ReceiptRepository } from "./receipt.repository";
import type { DBInsertMessageReceiptType } from "@pingxy/shared/domain/message-receipt/message-receipt.types";

describe("Message Receipts Table Schema", () => {
  beforeAll(async () => {
    // await db.delete(message_receipts);
  });

  // afterAll(async () => {
  //     await db.delete(message_receipts);
  // });

  test("should insert a new message receipt", async () => {
    const newMessageReceipt: DBInsertMessageReceiptType = {
      conversationId: 1,
      messageId: 49,
      userId: 2,
      status: "sent",
    };
    const result = await ReceiptRepository.insertMessageReceipt(newMessageReceipt);
    expect(result).toHaveLength(1);
  });

  test("should update a message receipt", async () => {
    const result = await ReceiptRepository.updateMessageReceipt({
      receiptId: 9,
      status: "delivered" as const,
      deliveredAt: new Date(Date.now()),
      readAt: new Date(Date.now()),
    });
    expect(result).toHaveLength(1);
  });

  test("should select receipts for a message", async () => {
    const result = await ReceiptRepository.selectReceiptsForMessage(32);
    expect(result).toHaveLength(1);
  });

  test("should select unread messages for a user", async () => {
    const result = await ReceiptRepository.selectUnreadMessagesForUser(2);
    expect(result).toBeArray();
  });

  test("should insert bulk message receipts", async () => {
    const newMessageReceipts: NewMessageReceipt[] = [
      {
        conversationId: 1,
        messageId: 39,
        userId: 2,
        status: "sent",
      },
      {
        conversationId: 1,
        messageId: 48,
        userId: 2,
        status: "sent",
      },
    ];
    const result = await ReceiptRepository.insertBulkMessageReceipts(newMessageReceipts);
    expect(result).toHaveLength(2);
  });
});
