// fetch only conversations in which a user is a participant
export const fetchConversations = async () => {
  const response = await fetch(`/api/conversations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();
  return data.conversations;
};
