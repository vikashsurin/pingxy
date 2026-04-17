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
});
