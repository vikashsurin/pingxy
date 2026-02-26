export const fetchConversations = async ({
  customFetch,
  userId,
}: {
  customFetch: typeof fetch;
  userId: number;
}) => {
  const response = await customFetch(`/api/conversations?userId=${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) throw new Error(`External API Error: ${response.status}`);

  return await response.json();
};

export const fetchPartner = async ({
  customFetch,
  conversationId,
}: {
  customFetch: typeof fetch;
  conversationId: number;
}) => {
  const response = await customFetch(
    `/api/conversations/${conversationId}/partner`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  if (!response.ok) throw new Error(`External API Error: ${response.status}`);

  return await response.json();
};
