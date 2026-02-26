import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import * as queries from "./conversation.repository";
import { ConversationRepository } from "./conversation.repository";
import { ConversationService } from "./conversation.service";
describe("Conversations Table Schema", () => {
  beforeAll(async () => {
    // Clear table before tests if needed
    // await db.delete(conversations);
  });
  const userId = 1;
  // test("should insert a new conversation", async () => {
  //   const newConversation = {
  //     conversationType: "direct" as const,
  //     name: "Test Conversation",
  //     createdBy: userId,
  //     createdAt: new Date(Date.now()),
  //     updatedAt: new Date(Date.now()),
  //   };
  //   // const result = await queries.insertConversation(newConversation);
  //   // expect(result).toHaveLength(1);
  // });

  // test("should select a conversation by id", async () => {
  //   // const result = await queries.selectConversationById(7);
  //   // expect(result).toHaveLength(1);
  // });

  test("should select a conversation id by user ids", async () => {
    const result = await ConversationRepository.selectByUsersPrecise(2, 14)
    expect(result).toBeObject();
  });

  test("should return all conversations of a user", async () => {
    const result = await ConversationService.getAlByUser({ userId: 2 });
    console.log("result: ", JSON.stringify(result, null, 2))
    expect(result).toBeTruthy();
  })

  test.only("should return a conversation ", async () => {
    const result = await ConversationRepository.selectById(4)
    console.log({ result })
    expect(result).toBeDefined()
  })

});
