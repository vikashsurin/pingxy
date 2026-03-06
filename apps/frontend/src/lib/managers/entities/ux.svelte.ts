import { messageStore } from "$lib/stores/messageStore.svelte";
import { validateSocket } from "$lib/utils/validateSocket";
import {
  DOMAIN_EVENTS,
  SERVER_EVENTS,
  type ServerEventMap,
} from "@pingxy/shared";
import { createClientReq } from "../factory";

const createUxManager = () => ({
  emitTyping: ({
    conversationId,
    userId,
  }: {
    conversationId: number;
    userId: number;
  }) => {
    const socket = validateSocket();
    if (!socket) return;

    const payload = createClientReq(DOMAIN_EVENTS.TYPING.START, {
      conversationId: conversationId,
      userId: userId,
    });
    socket.send(JSON.stringify(payload));
  },

  handleTypingEvent: (
    data: ServerEventMap[typeof SERVER_EVENTS.TYPING.STARTED],
  ) => {
    const { conversationId, userId } = data.payload;
    const chat = messageStore.chats.get(conversationId);
    if (chat) chat.handleTyping();
  },
});

export const uxManager = createUxManager();
