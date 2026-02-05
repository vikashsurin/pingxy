import type {
  ClientNewMessageType,
  MessageReceipt,
  ServerNewMessageType,
} from "@pingxy/shared";
import { chatStore } from "../store.svelte";
import { virtualStore } from "../virtualStore.svelte";
import { fetchMessages } from "../services/api";
import Chatbox from "../../../routes/chat/Chatbox.svelte";
import {
  handleIncomingReceipts,
  emitMarkRead,
  emitMarkDelivered,
} from "./receipt.svelte";

export const loadInitialMessages = async ({
  conversationId,
  currentUserId,
  limit,
}: {
  conversationId: number;
  currentUserId: number;
  limit: number;
}) => {
  if (!currentUserId || !conversationId) {
    throw new Error("Invalid conversation or user ID");
  }

  try {
    const data = await fetchMessages({
      conversationId,
      currentUserId,
      limit,
    });

    virtualStore.absoluteLatestMessageId = data.chat.at(-1).message.messageId;
    chatStore.messages[conversationId] = {};
    for (const entry of data.chat) {
      chatStore.messages[conversationId][entry.message.messageId] = entry;
    }
    return data;
  } catch (error) {
    chatStore.error =
      error instanceof Error ? error.message : "Failed to load messages";
    console.error("Load initial messages error:", error);
    throw error;
  }
};

export const sendMessage = async ({ messageText }: { messageText: string }) => {
  if (!chatStore.activeConversation || !chatStore.currentUser) {
    chatStore.error = "No active conversation or user";
    return;
  }

  const envelope: ClientNewMessageType = {
    id: crypto.randomUUID(),
    type: "message.new",
    payload: {
      message: {
        conversationId: chatStore.activeConversation.conversationId,
        clientMessageId: crypto.randomUUID(),
        content: messageText,
        messageType: "text",
        senderId: chatStore.currentUser.id,
      },
      conversationId: chatStore.activeConversation.conversationId,
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
      // Custom error for ui
      // Example: Failed to send message
      throw new Error(error.message || "Failed to send message");
    }

    const data = await response.json();
    const result = data.result as ServerNewMessageType;

    await _addMessage(result);
    return null;
  } catch (error) {
    chatStore.error =
      error instanceof Error ? error.message : "Failed to send message";
    console.error("Send message error:", error);
    throw error;
  }
};

export const handleIncomingMessage = async (data: ServerNewMessageType) => {
  _addMessage(data);
  console.log("handle read receipt");
  const receipt = data.payload.receipt as MessageReceipt;
  // handleIncomingReceipts([receipt]);
  if (
    chatStore.activeConversation?.conversationId ===
    data.payload.conversationId
  ) {
    console.log("mark as read");
    emitMarkRead({
      message: data.payload.message,
      userId: chatStore.currentUser?.id!,
    });
  } else {
    // Handle other cases if needed
    emitMarkDelivered({
      message: data.payload.message,
      userId: chatStore.currentUser?.id!,
    });
  }
};

export const updateMessage = async () => {};
export const deleteMessage = async () => {};

// Private
const _addMessage = async (data: ServerNewMessageType) => {
  const { message, conversationId, receipt } = data.payload;

  if (!chatStore.messages[conversationId]) {
    chatStore.messages[conversationId] = {};
  }
  chatStore.messages[conversationId][message.messageId] = {
    message,
    receipt,
  };
};
