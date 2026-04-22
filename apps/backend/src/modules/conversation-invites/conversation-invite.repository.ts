import { db, DB_TX } from "@lib/db/client";
import { conversationInvites, InviteInserSchema } from "@pingxy/shared";
import { eq, inArray, sql, } from "drizzle-orm";
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

  selectById: async (id: number) => {
    const row = await db
      .select()
      .from(conversationInvites)
      .where(eq(
        conversationInvites.id,
        id,
      ))

    return row[0];
  },

  selectByCode: async (code: string) => {
    const row = await db
      .select()
      .from(conversationInvites)
      .where(eq(
        conversationInvites.inviteCode,
        code,
      ))

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

  incrementInviteUseCount: async ({ code, tx = db }: { code: string; tx?: DB_TX }) => {
    await tx
      .update(conversationInvites)
      .set({
        usesCount: sql`${conversationInvites.usesCount} + 1`,
      })
      .where(eq(conversationInvites.inviteCode, code));
  },

  // Delete multiple invites by id, in a batch/array
  deleteInvitesByIds: async (ids: number[], tx = db) => {
    if (ids.length === 0) return;
    return await tx
      .delete(conversationInvites)
      .where(inArray(conversationInvites.id, ids))
      .returning({ id: conversationInvites.id })
  },
};
