import type { SERVER_EVENTS } from "@pingxy/shared";
import { DOMAIN_EVENTS } from "@pingxy/shared/constants/index";
import type { ServerEventMap } from "@pingxy/shared/socket/types";
import { createClientReq } from "..";
import { createMessage, fetchMessages } from "../../services/api";
import { chatStore } from "../../store.svelte";
import { virtualStore } from "../../virtualStore.svelte";
import { emitMarkDelivered, emitMarkRead } from "./receipt.svelte";

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
  const conversationId = chatStore.activeConversation.conversationId;

  const envelope = createClientReq(DOMAIN_EVENTS.MESSAGES.CREATE, {
    message: {
      conversationId: conversationId ?? null,
      clientMessageId: crypto.randomUUID(),
      content: messageText,
      senderId: chatStore.currentUser.id,
    },
    conversationId: conversationId ?? null,
    recipient: {
      id: chatStore.activeConversation.user.id,
      username: chatStore.activeConversation.user.username,
    },
  });

  try {
    const result = await createMessage(envelope);
    await addMessageToState(result);

    return null;
  } catch (error) {
    chatStore.error =
      error instanceof Error ? error.message : "Failed to send message";
    console.error("Send message error:", error);
    throw error;
  }
};

export const handleIncomingMessage = async (
  data: ServerEventMap[typeof SERVER_EVENTS.MESSAGES.CREATED],
) => {
  addMessageToState(data);

  if (
    chatStore.activeConversation?.conversationId === data.payload.conversationId
  ) {
    if (data.payload.message.senderId !== chatStore.currentUser?.id) {
      emitMarkRead({
        message: data.payload.message,
        userId: chatStore.currentUser?.id!,
      });
    }
  } else {
    // Handle other cases if needed
    emitMarkDelivered({
      message: data.payload.message,
      userId: data.payload.recipient.id,
    });
  }
};

export const updateMessage = async () => {};
export const deleteMessage = async () => {};

// Private
const addMessageToState = async (
  data: ServerEventMap[typeof SERVER_EVENTS.MESSAGES.CREATED],
) => {
  const { message, conversationId, receipt } = data.payload;

  if (!chatStore.messages[conversationId]) {
    chatStore.messages[conversationId] = {};
  }
  chatStore.messages[conversationId][message.messageId] = {
    message,
    receipt,
  };
};
