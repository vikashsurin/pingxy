export const createBlockApi = (customFetch: typeof fetch = fetch) => ({
  blockUser: async ({
    blockerId,
    blockedId,
  }: {
    blockerId: number;
    blockedId: number;
  }) => {
    const response = await customFetch(`/api/blocks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ blockerId, blockedId }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to block user");
    }

    return await response.json();
  },

  unblockUser: async ({ blockId }: { blockId: number }) => {
    const response = await customFetch(`/api/blocks/${blockId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to unblock user");
    }
    return await response.json();
  },

  fetchBlockedUserIds: async ({ blockerId }: { blockerId: number }) => {
    const response = await customFetch(`/api/blocks/blocker/${blockerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch blocked users");
    }

    return await response.json();
  },

  fetchBlockedUsers: async ({ blockerId }: { blockerId: number }) => {
    const response = await customFetch(
      `/api/blocks/blocker/${blockerId}/with-info`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch blocked users");
    }

    return await response.json();
  },
});

export const blockApi = createBlockApi();
