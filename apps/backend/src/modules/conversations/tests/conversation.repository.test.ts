import { describe, it, expect } from "bun:test";
import { ConversationRepository } from "../conversation.repository";


describe("ConversationRepository", () => {
  it(" should return a conversation or null", async () => {
    const user1 = 1;
    const user2 = 2;
    const result = await ConversationRepository.selectExistingBetweenUids(user1, user2);

    console.log({ result })
    expect(result).toBeArray();
  });
  it('should return all direct conversations', async () => {
    const userId = 1;
    const result = await ConversationRepository.selectConversations({ userId, type: 'direct' });

    console.log({ result })
    expect(result).toBeArray();
  });

  it("should return all group conversations", async () => {
    const userId = 1;
    const result = await ConversationRepository.selectConversations({ userId, type: 'group' });

    console.log({ result })
    expect(result).toBeArray();
  });

  it("should return all conversations", async () => {
    const userId = 1;
    const result = await ConversationRepository.selectConversations({ userId });

    console.log({ result })
    expect(result).toBeArray();
  });

  it("should return a conversation ", async () => {
    const conversationId = 8;
    const result = await ConversationRepository.selectById(conversationId);



    console.log({ result })
    expect(result).toBeObject();
  })
});
