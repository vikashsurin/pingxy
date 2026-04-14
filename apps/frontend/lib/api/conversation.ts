import { ClientReqMap } from "@pingxy/shared";

function createConversationApi() {
  const baseUrl = "http://localhost/api/conversations";
  // find a conversation between 2 users
  const findConversation = async ({ userId }: { userId: number }) => {
    const url = `${baseUrl}/new-find?userId=${userId}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) {
      console.error("findConversation failed", await res.json());
      throw new Error("findConversation failed");
    }
    const data = await res.json();
    return data;
  };

  // fetch all conversations of a user
  const fetchConversations = async ({
    type,
  }: {
    type?: "direct" | "group";
  }) => {
    console.log("api called", type);
    const url = `http://localhost/api/conversations?type=${type}`;
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
  const fetchMessages = async ({
    conversationId,
    before,
    after,
    limit = 20,
  }: {
    conversationId: number;
    limit?: number;
    before?: number | null;
    after?: number | null;
  }) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    if (before != null) params.append("before", before.toString());
    if (after != null) params.append("after", after.toString());

    const url = `http://localhost/api/conversations/${conversationId}/messages?${params.toString()}`;

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

  // create a group/conversation
  const createGroup = async (
    payload: ClientReqMap["req:conversation.create"],
  ) => {
    const url = `${baseUrl}/groups`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("createGroup failed", await res.json());
      throw new Error("createGroup failed");
    }

    const data = await res.json();
    return data;
  };

  return {
    findConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createGroup,
  };
}

export const conversationsApi = createConversationApi();
