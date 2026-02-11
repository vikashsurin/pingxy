import { fetchConversations } from "$lib/store/services/api/conversation";
import { DOMAIN_EVENTS } from "@pingxy/shared/constants/index";
import type { ClientReqMap } from "@pingxy/shared/socket/types";
import { validateSocket } from "../../helpers";
import { chatStore, type PrivateConversation } from "../../store.svelte";

export const subscribeToConversation = async ({
  conversation,
  userId,
}: {
  conversation: PrivateConversation;
  userId: number | undefined;
}) => {
  if (!conversation.conversationId || !userId) return;

  const socket = validateSocket();
  if (!socket) return;

  const message: ClientReqMap[typeof DOMAIN_EVENTS.CONVERSATIONS.OPEN] = {
    id: crypto.randomUUID(),
    type: DOMAIN_EVENTS.CONVERSATIONS.OPEN,
    payload: {
      conversationId: conversation.conversationId,
      userId: userId,
    },
  };

  socket.send(JSON.stringify(message));
};

export const initConversations = async () => {
  const conversations = await fetchConversations();
  conversations.forEach((element: any) => {
    chatStore.conversations[element.conversationId] = element;
  });
};

export const resetUnreadCount = (conversationId: number) => {
  if (chatStore.conversations[conversationId]) {
    chatStore.conversations[conversationId].unreadCount = 0;
  }
};

export const setUnreadCount = (conversationId: number) => {
  if (chatStore.conversations[conversationId]) {
    chatStore.conversations[conversationId].unreadCount++;
  }
};
