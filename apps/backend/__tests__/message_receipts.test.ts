import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { db } from '../../backend/src/db/client'
import { NewMessageReceipt } from "@chat/shared/src/lib/utils/validation";
import * as queries from '../src/db/queries/index'
import { message_receipts } from '../src/db/schema/index'

describe("Message Receipts Table Schema", () => {
  beforeAll(async () => {
    // await db.delete(message_receipts);
  });

  // afterAll(async () => {
  //     await db.delete(message_receipts);
  // });

  test("should insert a new message receipt", async () => {
    const newMessageReceipt: NewMessageReceipt = {
      message_id: 49,
      user_id: 2,
      status: "sent",
    };
    const result = await queries.insertMessageReceipt(newMessageReceipt);
    expect(result).toHaveLength(1);
  });

  test("should update a message receipt", async () => {
    const result = await queries.updateMessageReceipt({
      receipt_id: 9,
      status: "delivered" as const,
      delivered_at: new Date(Date.now()),
      read_at: new Date(Date.now())
    });
    expect(result).toHaveLength(1);
  });

  test("should select receipts for a message", async () => {
    const result = await queries.selectReceiptsForMessage(32);
    expect(result).toHaveLength(1);
  });

  test("should select unread messages for a user", async () => {
    const result = await queries.selectUnreadMessagesForUser(2);
    console.log({ result });
    expect(result).toBeArray()
  });

  test("should insert bulk message receipts", async () => {
    const newMessageReceipts: NewMessageReceipt[] = [
      {
        message_id: 39,
        user_id: 2,
        status: "sent",

      },
      {
        message_id: 48,
        user_id: 2,
        status: "sent",
      },
    ];
    const result = await queries.insertBulkMessageReceipts(newMessageReceipts);
    expect(result).toHaveLength(2);
  });
});
