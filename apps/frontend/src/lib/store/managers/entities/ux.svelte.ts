import { validateSocket } from "$lib/store/helpers";
import {
  DOMAIN_EVENTS,
  SERVER_EVENTS,
  type ServerEventMap,
} from "@pingxy/shared";
import { createClientReq } from "../factory";
import { messageStore } from "$lib/store/messageStore.svelte";

export const emitTyping = ({
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
};

export const handleTypingEvent = (
  data: ServerEventMap[typeof SERVER_EVENTS.TYPING.STARTED],
) => {
  const { conversationId, userId } = data.payload;
  const chat = messageStore.chats.get(conversationId);
  if (chat) chat.handleTyping();
};
