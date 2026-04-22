import { describe, expect, it } from "bun:test";
import { ConversationService } from "@modules/conversations";
import { ConversationInviteService } from "../conversation-invite.service";


describe("ConversationInviteService", () => {
  it("should create an invite", async () => {
    const result = await ConversationService.createInvite({ groupId: 13, userId: 1 })

    console.log("result", result)
    expect(result).toBeDefined()
  });

  it('should get a invite', async () => {
    const result = await ConversationInviteService.getInviteById(6)
    console.log("result", result)
    expect(result).toBeDefined()
  })

  it('should create a participant', async () => {
    const result = await ConversationInviteService.joinViaInvite({ invitecode: "d73bee62-0f51-453d-bac5-c7236827b30f", userId: 5 })
    console.log("result", result)
    expect(result).toBeDefined()
  })
});
