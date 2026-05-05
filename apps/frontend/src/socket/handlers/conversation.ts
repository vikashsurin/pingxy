import { conversationService } from "@/src/services/conversationService";
import { SERVER_EVENTS, ServerEventMap } from "@pingxy/shared";
import { SocketHandlerMap } from "../dispatcher";

export const conversationHandler: SocketHandlerMap = {
  [SERVER_EVENTS.CONVERSATIONS.SUBSCRIBE]: (
    data: ServerEventMap["event:conversation.subscribe"],
  ) => {
    const payload = data.payload;

    conversationService.handleSubscription(payload)
  },
};
