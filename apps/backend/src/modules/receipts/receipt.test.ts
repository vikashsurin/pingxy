import { describe, test } from "bun:test";
import { ReceiptRepository } from "./receipt.repository";

describe("Message Receipts Table Schema", () => {
  test.only("should create message receipts", async () => {
    for (let i = 63; i < 73; i++) {
      const newReceipt = {
        conversationId: 2,
        messageId: i,
        readerId: 3,
        status: "read" as const,
      };
      await ReceiptRepository.insertMessageReceipt(newReceipt);
    }
  });

  test("should mark all read", async () => {
    const result = await ReceiptRepository.updateAllMessageReceiptsToRead({
      conversationId: 2,
      readerId: 3,
    });
    console.log("result: ", result);
  });
});
