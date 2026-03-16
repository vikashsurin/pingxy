import { blockApi } from "$lib/api/block.api";
import { userStore } from "$lib/stores/userStore.svelte";
import { chatStore } from "../../stores/store.svelte";

const createBlockManager = () => ({
  blockUser: async (targetId: number) => {
    const blockerId = chatStore.currentUser?.id;
    const blockedId = targetId;
    if (!blockerId || !blockedId) return;

    const blockedUser = await blockApi.blockUser({ blockerId, blockedId });
    if (blockedUser) {
      userStore.blockedUserIds.add(blockedId);
      // chatStore.blockedUserIds.add(blockedId);
    }
    return;
  },
  unblockUser: async (blockId: number) => {
    if (!blockId) return;

    const unblockedUser = await blockApi.unblockUser({ blockId });
    if (unblockedUser) {
      userStore.unblockUser(blockId);
      // chatStore.blockedUserIds.delete(blockId);
    }
    return;
  },

  fetchBlockedUserIds: async () => {
    const blockerId = chatStore.currentUser?.id;
    if (!blockerId) return;

    const blocks = await blockApi.fetchBlockedUserIds({ blockerId });

    if (blocks) {
      userStore.seedFromBlockedUsers(blocks)

      // blocks.forEach((block: z.infer<typeof blockedUserSelectSchema>) => {
      //   chatStore.blockedUserIds.add(block.blockedId);
      // });
    }

    return;
  },

  fetchBlockedUsers: async () => {
    const blockerId = chatStore.currentUser?.id;
    if (!blockerId) return;

    const blockedUsers = await blockApi.fetchBlockedUsers({ blockerId });
    if (blockedUsers) {
      // chatStore.blockedUserIds = new Set(
      //   blockedUsers.map((user: User) => user.id),
      // );
    }
    return;
  },

  // initBlocks: async () => {
  //   await fetchBlockedUserIds();
  // },
  removeBlockedFromState: (blockedId: number) => {
    chatStore.blockedUserIds.delete(blockedId);
  },
});

export const blockManager = createBlockManager();
