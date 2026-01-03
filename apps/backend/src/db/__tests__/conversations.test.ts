import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { db } from "../client";
import { conversations } from "../schema/_schema";

import * as queries from "../queries/conversations.query";

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
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    };
    const result = await queries.insertConversation(newConversation);
    console.log({ result });
    expect(result).toHaveLength(1);
  });

  test("should select a conversation by id", async () => {
    const result = await queries.selectConversationById(7);
    console.log({ result });
    expect(result).toHaveLength(1);
  });

  test("should select a conversation by author id", async () => {
    const result = await queries.selectConversationByAuthorId(userId);
    console.log({ result });
    expect(result).toHaveLength(1);
  });
});
