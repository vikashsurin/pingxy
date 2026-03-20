import { describe, it } from "bun:test";
import { ReceiptRepository } from "../receipt.repository";

describe("ReceiptRepository", () => {
  it.only("should update a receipt", async () => {
    const result = await ReceiptRepository.update({
      messageId: 293,
      status: "read",
      readAt: new Date(),
    })
  });
});
