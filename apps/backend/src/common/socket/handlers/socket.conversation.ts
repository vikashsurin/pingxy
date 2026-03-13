import { DOMAIN_EVENTS, SERVER_EVENTS } from "@pingxy/shared/constants";
import { SocketHandler } from "./index";

export const conversationHandler: SocketHandler = {
  [DOMAIN_EVENTS.CONVERSATIONS.OPEN]: async (socket, data) => {
    const conversationId = data.payload.conversationId;
    socket.data.activeConversations.add(conversationId.toString());
    socket.subscribe(conversationId.toString());
    console.info("subscribed");
  },
};
