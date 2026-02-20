export const blockUserRequest = async ({
  customFetch,
  blockerId,
  blockedId,
}: {
  customFetch: typeof fetch;
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

  const data = await response.json();
  return data;
};

export const unblockUserRequest = async ({ blockId }: { blockId: number }) => {
  const response = await fetch(`/api/blocks/${blockId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to unblock user");
  }

  const data = await response.json();
  return data;
};

export const fetchBlockedUserIdsRequest = async ({
  blockerId,
}: {
  blockerId: number;
}) => {
  const response = await fetch(`/api/blocks/blocker/${blockerId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch blocked users");
  }

  const data = await response.json();
  return data;
};

export const fetchBlockedUsersRequest = async ({
  blockerId,
}: {
  blockerId: number;
}) => {
  const response = await fetch(`/api/blocks/blocker/${blockerId}/with-info`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch blocked users");
  }

  const data = await response.json();
  return data;
};
