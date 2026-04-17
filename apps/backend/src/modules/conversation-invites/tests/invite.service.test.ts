import { describe, expect, it } from "bun:test";
import { ConversationService } from "@modules/conversations";


describe("ConversationInviteService", () => {
  it("should create an invite", async () => {
    const result = await ConversationService.createInvite({ groupId: 13, userId: 1 })

    console.log("result", result)
    expect(result).toBeDefined()
  });
});
