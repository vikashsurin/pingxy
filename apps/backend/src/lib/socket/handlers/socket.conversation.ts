import { DOMAIN_EVENTS, SERVER_EVENTS } from "@pingxy/shared/constants";
import { SocketHandler } from "./index";
import { connectionManager } from "../connectionManager";
import { ConversationService } from "@modules/conversations";

export const conversationHandler: SocketHandler = {
  // [DOMAIN_EVENTS.CONVERSATIONS.OPEN]: async (socket, data) => {
  //   const conversationId = data.payload.conversationId;
  //   socket.data.activeConversations.add(conversationId.toString());
  //   socket.subscribe(conversationId.toString());
  //   console.info("subscribed");
  // },
  //
  [DOMAIN_EVENTS.CONVERSATIONS.SUBSCRIBE]: async (socket, data) => {
    const conversationId = data.payload.conversationId;

    socket.subscribe(`channel:${conversationId.toString()}`);

    // Send a notification to the client that they are subscribed
    ConversationService.subscribed(conversationId)
  },
};
