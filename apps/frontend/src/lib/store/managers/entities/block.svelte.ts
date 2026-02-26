import {
  blockUserRequest,
  fetchBlockedUserIdsRequest,
  fetchBlockedUsersRequest,
  unblockUserRequest,
} from "$lib/store/services/api/block";
import type { blockedUserSelectSchema, User } from "@pingxy/shared";
import { chatStore } from "../../store.svelte";
import type z from "zod";

export const blockUser = async (targetId: number) => {
  const blockerId = chatStore.currentUser?.id;
  const blockedId = targetId;
  if (!blockerId || !blockedId) return;

  const blockedUser = await blockUserRequest({ blockerId, blockedId });
  if (blockedUser) {
    chatStore.blockedUserIds.add(blockedId);
  }
  return;
};

export const unblockUser = async (blockId: number) => {
  if (!blockId) return;

  const unblockedUser = await unblockUserRequest({ blockId });
  if (unblockedUser) {
    chatStore.blockedUserIds.delete(blockId);
  }
  return;
};

export const fetchBlockedUserIds = async () => {
  const blockerId = chatStore.currentUser?.id;
  if (!blockerId) return;

  const blocks = await fetchBlockedUserIdsRequest({ blockerId });

  if (blocks) {
    blocks.forEach((block: z.infer<typeof blockedUserSelectSchema>) => {
      chatStore.blockedUserIds.add(block.blockedId);
    });
  }

  console.log({ blocks });
  return;
};

export const fetchBlockedUsers = async () => {
  const blockerId = chatStore.currentUser?.id;
  if (!blockerId) return;

  const blockedUsers = await fetchBlockedUsersRequest({ blockerId });
  if (blockedUsers) {
    // chatStore.blockedUserIds = new Set(
    //   blockedUsers.map((user: User) => user.id),
    // );
  }
  console.log({ blockedUsers });
  return;
};

export const initBlocks = async () => {
  await fetchBlockedUserIds();
};

export const removeBlockedFromState = (blockedId: number) => {
  chatStore.blockedUserIds.delete(blockedId);
};
