export const createConversationApi = (customFetch: typeof fetch = fetch) => ({
  fetchInitialData: async () => {
    const res = await customFetch(`/api/conversations/temp`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to Load Chat", { cause: res });
    return await res.json();
  },

  fetchConversations: async ({ userId }: { userId: number }) => {
    const res = await customFetch(`/api/conversations?userId=${userId}`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch conversations");
    return await res.json();
  },

  fetchPartner: async ({ conversationId }: { conversationId: number }) => {
    const res = await customFetch(
      `/api/conversations/${conversationId}/partner`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    if (!res.ok) throw new Error("Failed to fetch partner");
    return await res.json();
  },

  findByUser: async ({ userId }: { userId: number }) => {
    const res = await customFetch(`/api/conversations/find?userId=${userId}`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch conversations");
    return await res.json();
  },
});

export const conversationApi = createConversationApi();
