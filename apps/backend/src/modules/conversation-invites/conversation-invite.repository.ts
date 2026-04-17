import { db, DB_TX } from "@lib/db/client";
import { conversationInvites, InviteInserSchema } from "@pingxy/shared";
import { eq } from "drizzle-orm";
import z from "zod";
export const ConversationInviteRepository = {
  insert: async ({ invite, tx = db }: { invite: z.infer<typeof InviteInserSchema>; tx?: DB_TX }) => {

    const row = await tx
      .insert(conversationInvites)
      .values({
        conversationId: invite.conversationId,
        requiresApproval: invite.requiresApproval,
        inviteCode: invite.inviteCode,
        createdBy: invite.createdBy,
        expiresAt: invite.expiresAt,
        maxUses: invite.maxUses,
        createdAt: invite.createdAt,
      })
      .returning();

    return row[0];
  },

  selectAll: async ({ groupId }: { groupId: number }) => {
    const rows = await db
      .select()
      .from(conversationInvites)
      .where(eq(
        conversationInvites.conversationId,
        groupId,
      ))

    return rows;
  },
};
