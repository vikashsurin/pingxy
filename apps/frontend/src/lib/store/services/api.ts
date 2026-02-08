import type { SocketEventMap } from "@pingxy/shared";

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

export const createMessage = async (
  envelope: SocketEventMap["req:message.create"],
) => {
  try {
    const response = await fetch(`/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        ...envelope,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      // Custom error for ui
      // Example: Failed to send message
      throw new Error(error.message || "Failed to send message");
    }

    const data = await response.json();

    console.log({ data });
    return data.result;
  } catch (error) {
    console.error("Failed to send message");
    throw error;
  }
};

export const fetchConversation = async ({
  currentUserId,
  userId,
}: {
  currentUserId: number;
  userId: number;
}) => {
  const response = await fetch(
    `/api/conversations/${currentUserId}/${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch conversation");
  }

  const data = await response.json();
  return data.conversation;
};
