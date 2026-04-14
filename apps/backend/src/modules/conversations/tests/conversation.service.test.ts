import { describe, it, expect } from "bun:test";
import { ConversationService } from "../conversation.service";




describe("ConversationService", () => {
  it(" should return a conversation or null", async () => {
    const user1 = 1;
    const user2 = 2;
    const result = await
      ConversationService.newFindByUsers({ authUserId: user1, userId: user2 });
    console.log({ result })
    expect(result).toBeNull();
  });

  it('should return direct conversations ', async () => {
    const result = await ConversationService.getConversations({ userId: 1, type: 'direct' });
    console.log('result', result)
    expect(result).toBeDefined();
  });

  it('should return group conversations ', async () => {
    const result = await ConversationService.getConversations({ userId: 1, type: 'group' });
    console.log('result', result)
    expect(result).toBeDefined()
  });

  it('should return all conversations', async () => {
    const result = await ConversationService.getConversations({ userId: 1 });
    console.log('result', result)
    expect(result).toBeDefined()
  });
});
