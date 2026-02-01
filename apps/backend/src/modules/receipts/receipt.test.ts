import { describe, test, expect, beforeAll } from "bun:test";
import { NewMessageReceipt } from "@pingxy/shared/types";
import { ReceiptRepository } from "./receipt.repository";

describe("Message Receipts Table Schema", () => {
  beforeAll(async () => {
    // await db.delete(message_receipts);
  });

  // afterAll(async () => {
  //     await db.delete(message_receipts);
  // });

  test("should insert a new message receipt", async () => {
    const newMessageReceipt: NewMessageReceipt = {
      conversation_id: 1,
      message_id: 49,
      user_id: 2,
      status: "sent",
    };
    const result = await ReceiptRepository.insertMessageReceipt(newMessageReceipt);
    expect(result).toHaveLength(1);
  });

  test("should update a message receipt", async () => {
    const result = await ReceiptRepository.updateMessageReceipt({
      receipt_id: 9,
      status: "delivered" as const,
      delivered_at: new Date(Date.now()),
      read_at: new Date(Date.now()),
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
        conversation_id: 1,
        message_id: 39,
        user_id: 2,
        status: "sent",
      },
      {
        conversation_id: 1,
        message_id: 48,
        user_id: 2,
        status: "sent",
      },
    ];
    const result = await ReceiptRepository.insertBulkMessageReceipts(newMessageReceipts);
    expect(result).toHaveLength(2);
  });
});
