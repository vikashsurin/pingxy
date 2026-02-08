import { type SocketHandlers } from "@pingxy/shared/socket/types";
import * as messageManager from "$lib/store/managers/message.svelte";
import { SERVER_EVENTS } from "@pingxy/shared/constants/index";

export const messageHandler: SocketHandlers = {
  [SERVER_EVENTS.MESSAGES.CREATED]: (data) => {
    messageManager.handleIncomingMessage(data);
  },
};
