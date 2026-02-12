import { UserRepository } from "@modules/users/user.repository";
import { BlocksRepository } from "./block.repository";
import { z } from "zod";
import {
  blockedUserInfoSchema,
  blockedUserSelectSchema,
} from "@pingxy/shared/domain/blocked-user/blocked-user.schema";
import { createServerEvent } from "@common/socket/socket.factory";
import { SERVER_EVENTS } from "@pingxy/shared/constants";
import { eventBus } from "@common/events";
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

      if (!unblocked) {
        throw new Error("error unblocking user");
      }
      const event = createServerEvent(SERVER_EVENTS.BLOCKS.UNBLOCKED, {
        ...unblocked,
      });
      eventBus.emit(SERVER_EVENTS.BLOCKS.UNBLOCKED, event);

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

  listBlockedUsersWithInfo: async ({ blockerId }: { blockerId: number }) => {
    type Block = Partial<z.infer<typeof blockedUserSelectSchema>>;

    try {
      const blocked = await BlocksRepository.selectAllBlocked({ blockerId });
      const blockedMap = new Map<number, Block>();

      blocked.forEach((block) => {
        blockedMap.set(block.blockedId, { ...block });
      });

      const blockedIds = blocked.map(({ blockedId }) => blockedId);

      const users = await UserRepository.selectManyByIds({
        ids: blockedIds,
      });
      const blockedUsers = users.map((user) => ({
        ...user,
        block: blockedMap.get(user.id),
      }));
      return blockedUsers;
    } catch (error) {
      throw new Error("error getting blocked users with info");
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

  hasBlock: async ({
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
