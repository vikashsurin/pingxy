export const createConversationApi = (customFetch: typeof fetch = fetch) => {
  const createGroupConversation = async (conversation: any) => {
    const res = await customFetch(`/api/conversations/groups`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conversation),
    });

    if (!res.ok)
      throw new Error("Failed to Create Conversation", { cause: res });
    return await res.json();
  };

  const fetchInitialData = async () => {
    const res = await customFetch(`/api/conversations`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to Load Chat", { cause: res });
    return await res.json();
  };
  return {
    fetchInitialData,
    createGroupConversation,
  };
};

export const conversationApi = createConversationApi();
