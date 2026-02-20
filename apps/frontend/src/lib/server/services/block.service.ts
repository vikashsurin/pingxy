import { blockUserRequest, unblockUserRequest } from "../api/block";

export const BlockService = {
  block: async ({
    customFetch,
    blockerId,
    blockedId,
  }: {
    customFetch: typeof fetch;
    blockerId: number;
    blockedId: number;
  }) => {
    return await blockUserRequest({ customFetch, blockerId, blockedId });
  },

  unblock: async ({
    customFetch,
    blockId,
  }: {
    customFetch: typeof fetch;
    blockId: number;
  }) => {
    return await unblockUserRequest({ customFetch, blockId });
  },
};
