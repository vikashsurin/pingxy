import { SERVER_EVENTS } from "@pingxy/shared/constants";
import { connectionManager } from "../connectionManager";

import { BusListener } from "./index";

export const conversationListener: BusListener = {
  [SERVER_EVENTS.CONVERSATIONS.SUBSCRIBE]: async (data) => {
    const { conversationId } = data.payload;

    connectionManager.publish(`conversation:${conversationId}`, JSON.stringify(data));
  },
};
