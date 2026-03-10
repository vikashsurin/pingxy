import { beforeAll, describe, expect, test } from "bun:test";
import { MessageRepository } from "./message.repository";

const insertMessages = async () => {
  const limit = 10;
  for (let i = 0; i < limit; i++) {
    const newMessage = {
      conversationId: 2,
      clientMessageId: crypto.randomUUID(),
      senderId: 1,
      content: "Testing" + "_" + i + i,
    };
    await MessageRepository.insertMessage(newMessage);
  }
};

describe("Messages Table Schema", () => {
  beforeAll(async () => {
    // await db.delete(messages);
  });

  test("should insert a new message", async () => {
    // await insertMessages();
    const newMessage = {
      conversationId: 1,
      clientMessageId: crypto.randomUUID(),
      senderId: 1,
      content: "Testing",
    };
    const result = await MessageRepository.insertMessage(newMessage);
    expect(result).toHaveLength(1);
  });

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
  //     conversationId: 3,
  //     userId: 1,
  //     tx: db
  //   });
  //   expect(result).toBeDefined();
  // });

  test.only("should select messsages with detail", async () => {
    const result = await MessageRepository.selectMessages({
      conversationId: 1,
      userId: 1,
      before: 20,
      limit: 20,
    });

    console.log("result:: ", result);
    expect(result).toBeDefined();
  });
});
