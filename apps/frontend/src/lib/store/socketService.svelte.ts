import { type ClientPayloadType } from "@pingxy/shared/ws/types";

// import type { MessagePayload } from "@pingxy/shared/types";
import { chatStore } from "./store.svelte";

export const socketService = {
  async sendMessage({ messageText }: { messageText: string }) {
    if (!chatStore.activeConversation || !chatStore.currentUser) {
      chatStore.error = "No active conversation or user";
      return;
    }

    const envelope: ClientPayloadType = {
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

    console.log({ envelope });

    // const messagePayload: MessagePayload = {
    //   type: "message",
    //   id: crypto.randomUUID(),
    //   recipient: {
    //     id: chatStore.activeConversation.user.id,
    //     username: chatStore.activeConversation.user.username,
    //   },
    //   msgData: {
    //     message: {
    //       conversation_id: chatStore.activeConversation.conversation_id,
    //       client_message_id: crypto.randomUUID(),
    //       content: messageText,
    //       message_type: "text",
    //       sender_id: chatStore.currentUser.id,
    //     },
    //   },
    // };

    try {
      // const response = await fetch(`/api/messages`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   credentials: "include",
      //   body: JSON.stringify({
      //     isNew: true,
      //     messagePayload: messagePayload,
      //   }),
      // });

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
};
