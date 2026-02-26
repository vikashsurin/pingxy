type FetchMessagesParams = {
  customFetch?: typeof fetch;
  conversationId: number;
  currentUserId: number;
  limit: number;
};

export const fetchMessages = async ({
  customFetch = fetch,
  conversationId,
  currentUserId,
  limit,
}: FetchMessagesParams) => {
  try {
    const response = await customFetch(
      `/api/conversations/${conversationId}/messages/${currentUserId}?limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch messages");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch messages");
    throw error;
  }
};
