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
    const data = await fetchMessages({
      conversation_id,
      currentUserId,
      limit,
    });

    virtualStore.absoluteLatestMessageId = data.chat.at(-1).message.message_id;
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
    chatStore.activeConversation?.conversation_id ===
    data.payload.conversation_id
  ) {
    console.log("mark as read");
    emitMarkRead({
      message: data.payload.message,
      user_id: chatStore.currentUser?.id!,
    });
  } else {
    // Handle other cases if needed
    emitMarkDelivered({
      message: data.payload.message,
      user_id: chatStore.currentUser?.id!,
    });
  }
};

export const updateMessage = async () => {};
export const deleteMessage = async () => {};

// Private
const _addMessage = async (data: ServerNewMessageType) => {
  const { message, conversation_id, receipt } = data.payload;

  if (!chatStore.messages[conversation_id]) {
    chatStore.messages[conversation_id] = {};
  }
  chatStore.messages[conversation_id][message.message_id] = {
    message,
    receipt,
  };
};
