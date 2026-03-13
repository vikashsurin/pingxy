import type { ClientReqMap } from "@pingxy/shared";

export const createMessageApi = (customFetch: typeof fetch = fetch) => ({
  fetchMessages: async ({
    conversationId,
    limit,
  }: {
    conversationId: number;
    limit: number;
  }) => {
    const before = 20;
    const res = await customFetch(
      `/api/conversations/${conversationId}/messages?limit=${limit}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    if (!res.ok) throw new Error("Failed to fetch messages");
    return await res.json();
  },

  createMessage: async (envelope: ClientReqMap["req:message.create"]) => {
    const res = await customFetch(`/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        ...envelope,
      }),
    });


    if (!res.ok) throw new Error("Failed to send message");

    return await res.json();
  },
});

export const messageApi = createMessageApi();
