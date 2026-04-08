import { ClientReqMap } from "@pingxy/shared";

function createConversationApi() {
  // fetch all conversations of a user
  const fetchConversations = async () => {
    const url = `http://localhost/api/conversations`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) {
      console.error("fetchConversations failed", await res.json());
      throw new Error("fetchConversations failed");
    }
    const data = await res.json();
    return data;
  };

  // find a conversation between 2 users

  // fetch messages + meta data of a conversation
  const fetchMessages = async (conversationId: number) => {
    const url = `http://localhost/api/conversations/${conversationId}/messages`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) {
      console.error("fetchMessages failed", await res.json());
      throw new Error("fetchMessages failed");
    }
    const data = await res.json();
    return data;
  };

  // send a message
  const sendMessage = async (payload: ClientReqMap["req:message.create"]) => {
    const url = `http://localhost/api/conversations/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("sendMessage failed", await res.json());
      throw new Error("sendMessage failed");
    }
    const data = await res.json();
    return data;
  };

  // send a message to a conversation
  return {
    fetchConversations,
    fetchMessages,
    sendMessage,
  };
}

export const conversationsApi = createConversationApi();
