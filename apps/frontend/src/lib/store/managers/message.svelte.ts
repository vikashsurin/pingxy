import type { ClientNewMessageType, ServerNewMessageType } from "@pingxy/shared";
import { chatStore } from "../store.svelte";
import { virtualStore } from "../virtualStore.svelte";

export const messageManager = {
  async sendMessage({ messageText }: { messageText: string }) {
    if (!chatStore.activeConversation || !chatStore.currentUser) {
      chatStore.error = "No active conversation or user";
      return;
    }

    const envelope: ClientNewMessageType = {
      id: crypto.randomUUID(),
      type: "message.new",
      payload: {
        message: {
          conversation_id: chatStore.activeConversation.conversation_id,
          client_message_id: crypto.randomUUID(),
          content: messageText,
          message_type: "text",
          sender_id: chatStore.currentUser.id,
        },
        conversation_id: chatStore.activeConversation.conversation_id,
        recipient: {
          id: chatStore.activeConversation.user.id,
          username: chatStore.activeConversation.user.username,
        },
      },
    };
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
        throw new Error(error.message || "Failed to send message");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      chatStore.error =
        error instanceof Error ? error.message : "Failed to send message";
      console.error("Send message error:", error);
      throw error;
    }
  },

  handleMessage(data: ServerNewMessageType) {

    const { message, conversation_id, receipt } = data.payload;

    if (!chatStore.messages[conversation_id]) {
      chatStore.messages[conversation_id] = {};
    }
    chatStore.messages[conversation_id][message.message_id] = {
      message,
      receipt,

    }
  },

  loadInitialMessages: async ({
    conversation_id,
    currentUserId,
    limit,
  }: {
    conversation_id: number;
    currentUserId: number;
    limit: number;
  }) => {
    if (!currentUserId || !conversation_id) {
      throw new Error("Invalid conversation or user ID");
    }

    try {
      const response = await fetch(
        `/api/conversations/${conversation_id}/messages/${currentUserId}?limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load messages");
      }

      const data = await response.json();

      virtualStore.absoluteLatestMessageId =
        data.chat.at(-1).message.message_id;
      chatStore.messages[conversation_id] = {};
      for (const entry of data.chat) {
        chatStore.messages[conversation_id][entry.message.message_id] = entry;
      }
      return data;
    } catch (error) {
      chatStore.error =
        error instanceof Error ? error.message : "Failed to load messages";
      console.error("Load initial messages error:", error);
      throw error;
    }
  },
};
