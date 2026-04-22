import { InviteInserSchema } from "@pingxy/shared/domain";
import { describe, expect, it } from "bun:test";
import z from "zod";
import { ConversationInviteRepository } from "../conversation-invite.repository";


describe("ConversationInviteRepository", () => {
  it("should create an invite", async () => {

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const invite: z.infer<typeof InviteInserSchema> = {
      conversationId: 18,
      requiresApproval: false,
      inviteCode: crypto.randomUUID(),
      maxUses: 50,
      createdBy: 1,
      createdAt: new Date(),
      expiresAt: expiresAt,
    }
    const result = await ConversationInviteRepository.insert({ invite })

    console.log("result", result)
    expect(result).toBeDefined()
  });

  it('should get all invites', async () => {
    const result = await ConversationInviteRepository.selectAll({ groupId: 18 })
    console.log("result", result)
    expect(result).toBeDefined()
  })

  it('should get a invite', async () => {
    const result = await ConversationInviteRepository.selectById(6)
    console.log("result", result)
    expect(result).toBeDefined()
  })
  it('should get a invite by code', async () => {
    const result = await ConversationInviteRepository.selectByCode('d73bee62-0f51-453d-bac5-c7236827b30f')
    console.log("result", result)
    expect(result).toBeDefined()
  })

  it('should delete invites in an array', async () => {
    const result = await ConversationInviteRepository.deleteInvitesByIds([27, 28])
    console.log("result", result)
    expect(result).toBeDefined()
  })
});
