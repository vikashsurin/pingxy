import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { NewMessage } from "@chat/shared/src/lib/utils/validation";
import * as queries from "./internal/msg.queries";
import db from "@core/db/client";
describe("Messages Table Schema", () => {
  beforeAll(async () => {
    // await db.delete(messages);
  });

  const userId = 1;

  // test("should insert a new message", async () => {
  //   const newMessage: NewMessage = {
  //     conversation_id: 7,
  //     sender_id: userId,
  //     client_message_id: "123",
  //     content: "Hello",
  //   };
  //   const result = await queries.insertMessage(newMessage);
  //   expect(result).toHaveLength(1);
  // });

  // test("should update a message", async () => {
  //   const result = await queries.updateMessage(6, { content: "Hello World" });
  //   expect(result).toHaveLength(1);
  // });

  // test('should delete a message', async () => {
  //     const result = await deleteMessage(9)
  //     expect(result).toHaveLength(1)
  // })

  // test("should select a message by id", async () => {
  //   const result = await queries.selectMessageById(6);
  //   expect(result).toHaveLength(1);
  // });

  // test("should select messages by conversation id", async () => {
  //   const result = await queries.selectMessagesByConversationId(7);
  //   expect(result).toBeArray();
  // });

  // test("should select messages by sender id", async () => {
  //   const result = await queries.selectMessagesBySenderId(userId);
  //   expect(result).toBeArray();
  // });


  // test("should select messages and receipts by conversation id", async () => {
  //   const result = await queries.selectMessagesAndReceiptsByConversation({
  //     conversation_id: 3,
  //     user_id: 1,
  //     tx: db
  //   });
  //   expect(result).toBeDefined();
  // });

  test("should select limited messages by conversation id", async () => {
    const result = await queries.selectMessagesAndReceiptsByConversation({
      conversation_id: 3,
      user_id: 1,
      before: null,
      after: null,
      limit: 10,
      tx: db
    });
    console.log({ ...result })
    expect(result).toBeDefined();
  });
});
