import { conversationManager } from "@/lib/managers/conversationManager";
import { SERVER_EVENTS, ServerEventMap } from "@pingxy/shared";
import { SocketHandlerMap } from "../dispatcher";

export const messageHandler: SocketHandlerMap = {
  [SERVER_EVENTS.MESSAGES.CREATED]: (
    data: ServerEventMap["event:message.created"],
  ) => {
    if (!data) return;
    const payload = data.payload;

    conversationManager.handleNewMessage(payload);
  },
};
