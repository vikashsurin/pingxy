import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import * as queries from './internal/conv.queries'

describe("Conversations Table Schema", () => {
  beforeAll(async () => {
    // Clear table before tests if needed
    // await db.delete(conversations);
  });
  const userId = 1;
  test("should insert a new conversation", async () => {
    const newConversation = {
      conversation_type: "direct" as const,
      name: "Test Conversation",
      created_by: userId,
      created_at: new Date(Date.now()),
      updated_at: new Date(Date.now()),
    };
    const result = await queries.insertConversation(newConversation);
    expect(result).toHaveLength(1);
  });

  test("should select a conversation by id", async () => {
    const result = await queries.selectConversationById(7);
    expect(result).toHaveLength(1);
  });


});
