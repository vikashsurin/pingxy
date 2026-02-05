type FetchMessagesParams = {
  conversationId: number;
  currentUserId: number;
  limit: number;
};

export const fetchMessages = async ({
  conversationId,
  currentUserId,
  limit,
}: FetchMessagesParams) => {
  try {
    const response = await fetch(
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
