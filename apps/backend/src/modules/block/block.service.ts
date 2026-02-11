import { BlocksRepository } from "./block.repository";

export const BlockService = {
  block: async ({
    blockerId,
    blockedId,
  }: {
    blockerId: number;
    blockedId: number;
  }) => {
    try {
      const blocked = await BlocksRepository.insert({ blockerId, blockedId });
      return blocked;
    } catch (error) {
      throw new Error("error blocking user");
    }
  },

  unblock: async ({ blockId }: { blockId: number }) => {
    try {
      const unblocked = await BlocksRepository.deleteById({ blockId });
      return unblocked;
    } catch (error) {
      throw new Error("error unblocking user");
    }
  },

  findById: async ({ blockId }: { blockId: number }) => {
    try {
      const blocked = await BlocksRepository.selectById({ blockId });
      return blocked;
    } catch (error) {
      throw new Error("error getting blocked user");
    }
  },

  listBlocked: async ({ blockerId }: { blockerId: number }) => {
    try {
      const blockedUsers = await BlocksRepository.selectAllBlocked({
        blockerId,
      });
      return blockedUsers;
    } catch (error) {
      throw new Error("error getting blocked users");
    }
  },

  listBlockers: async ({ blockedId }: { blockedId: number }) => {
    try {
      const blockedUsers = await BlocksRepository.selectBlockers({ blockedId });
      return blockedUsers;
    } catch (error) {
      throw new Error("error getting blockers");
    }
  },

  find: async ({
    blockerId,
    blockedId,
  }: {
    blockerId: number;
    blockedId: number;
  }) => {
    try {
      const blockedUser = await BlocksRepository.selectUnique({
        blockerId,
        blockedId,
      });
      return blockedUser;
    } catch (error) {
      throw new Error("error finding blocked user");
    }
  },
  countBlocked: async ({ blockerId }: { blockerId: number }) => {
    try {
      const count = await BlocksRepository.countBlocked({ blockerId });
      return count;
    } catch (error) {
      throw new Error("error counting blocked users");
    }
  },

  listAll: async () => {
    try {
      const blockedUsers = await BlocksRepository.selectAll();
      return blockedUsers;
    } catch (error) {
      throw new Error("error getting blocked users");
    }
  },

  exists: async ({
    blockerId,
    blockedId,
  }: {
    blockerId: number;
    blockedId: number;
  }) => {
    try {
      const exists = await BlocksRepository.exists({ blockerId, blockedId });
      return exists;
    } catch (error) {
      throw new Error("error checking if block exists");
    }
  },
};
