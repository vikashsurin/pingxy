// fetch only conversations in which a user is a participant
export const fetchConversations = async ({ userId }: { userId: number }) => {
  const response = await fetch(`/api/conversations/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();
  return data.conversations;
};
