import type { SERVER_EVENTS } from "@pingxy/shared";
import { DOMAIN_EVENTS } from "@pingxy/shared/constants/index";
import type { ServerEventMap } from "@pingxy/shared/socket/types";
import { createClientReq } from "..";
import { createMessage, fetchMessages } from "../../services/api";
import { chatStore } from "../../store.svelte";
import { virtualStore } from "../../virtualStore.svelte";
import { emitMarkDelivered, emitMarkRead } from "./receipt.svelte";
import { setUnreadCount } from "./conversation.svelte";
import { getUser } from "../../services/api/user";

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
    sender: chatStore.currentUser,
    recipient: {
      id: chatStore.activeConversation.user.id,
      username: chatStore.activeConversation.user.username,
    },
  });

  try {
    const result = await createMessage(envelope);
    addMessageToState(result);

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
  // const { conversationId, message, recipient } = data.payload;
  // const currentUserId = chatStore.currentUser?.id;

  addMessageToState(data);

  // const isCurrentlyViewing =
  //   chatStore.activeConversation?.conversationId === conversationId;
  // const isFromMe = message.senderId === currentUserId;

  // if (isCurrentlyViewing && !isFromMe) {
  //   emitMarkRead({ message, userId: currentUserId! });
  // } else {
  //   emitMarkDelivered({ message, userId: recipient.id });
  //   // setUnreadCount(conversationId);
  // }
};

export const updateMessage = async () => {};
export const deleteMessage = async () => {};

// Private
const addMessageToState = async (
  data: ServerEventMap[typeof SERVER_EVENTS.MESSAGES.CREATED],
) => {
  const { message, conversationId, sender, receipt } = data.payload;
  const currentUser = chatStore.currentUser;
  const otherUser = chatStore.activeConversation?.user;

  if (!chatStore.messages[conversationId]) {
    chatStore.messages[conversationId] = {};
  }

  if (!chatStore.conversations[conversationId]) {
    const partner = message.senderId === currentUser?.id ? otherUser : sender;

    chatStore.conversations[conversationId] = {
      unreadCount: 0,
      conversationId: conversationId,
      user: partner!,
    };
  }

  chatStore.messages[conversationId][message.messageId] = {
    message,
    receipt,
  };

  const isFromMe = message.senderId === currentUser?.id;
  const isViewing =
    chatStore.activeConversation?.conversationId === conversationId;

  if (!isFromMe) {
    if (isViewing) {
      emitMarkRead({ message, userId: currentUser?.id! });
    } else {
      emitMarkDelivered({ message, userId: currentUser?.id! });
      setUnreadCount(conversationId);
    }
  }

  chatStore.drainPendingReceipts(conversationId);
};
