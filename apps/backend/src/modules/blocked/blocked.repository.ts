import { blockedUsers } from "@pingxy/shared";
import { and, eq } from "drizzle-orm";
import db, { DB_TX } from "src/common/db/client";

export const BlockedRepository = {
  insert: async ({
    blockerId,
    blockedId,
    tx = db,
  }: {
    blockerId: number;
    blockedId: number;
    tx?: DB_TX;
  }) => {
    const [result] = await tx
      .insert(blockedUsers)
      .values({ blockerId, blockedId })
      .returning();

    if (!result) {
      throw new Error("Failed to block user");
    }
    return result;
  },

  deleteById: async ({ blockId, tx = db }: { blockId: number; tx?: DB_TX }) => {
    const [result] = await tx
      .delete(blockedUsers)
      .where(eq(blockedUsers.blockId, blockId))
      .returning();

    if (!result) {
      throw new Error("Failed to unblock user");
    }
    return result;
  },

  selectBlockers: async ({
    blockedId,
    tx = db,
  }: {
    blockedId: number;
    tx?: DB_TX;
  }) => {
    const result = await tx
      .select()
      .from(blockedUsers)
      .where(eq(blockedUsers.blockedId, blockedId));

    if (!result) {
      throw new Error("Failed to selecting blockers");
    }
    return result;
  },

  selectById: async ({ blockId, tx = db }: { blockId: number; tx?: DB_TX }) => {
    const [result] = await tx
      .select()
      .from(blockedUsers)
      .where(eq(blockedUsers.blockId, blockId));

    if (!result) {
      throw new Error("Failed to select blocked user");
    }
    return result;
  },

  selectAllBlocked: async ({
    blockerId,
    tx = db,
  }: {
    blockerId: number;
    tx?: DB_TX;
  }) => {
    const result = await tx
      .select()
      .from(blockedUsers)
      .where(eq(blockedUsers.blockerId, blockerId));

    if (!result) {
      throw new Error("Failed to select blocked users");
    }
    return result;
  },

  selectUnique: async ({
    blockerId,
    blockedId,
    tx = db,
  }: {
    blockerId: number;
    blockedId: number;
    tx?: DB_TX;
  }) => {
    const [result] = await tx
      .select()
      .from(blockedUsers)
      .where(
        and(
          eq(blockedUsers.blockerId, blockerId),
          eq(blockedUsers.blockedId, blockedId),
        ),
      );

    if (!result) {
      throw new Error("Failed to select blocked user");
    }
    return result;
  },

  countBlocked: async ({
    blockerId,
    tx = db,
  }: {
    blockerId: number;
    tx?: DB_TX;
  }) => {
    const result = await tx
      .select()
      .from(blockedUsers)
      .where(eq(blockedUsers.blockerId, blockerId));

    if (!result) {
      throw new Error("Failed to count blocked users");
    }
    return result.length;
  },

  selectAll: async () => {
    const result = await db.select().from(blockedUsers);
    if (!result) {
      throw new Error("Failed to select all blocked users");
    }
    return result;
  },
};
