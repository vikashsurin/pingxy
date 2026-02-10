import * as messageManager from "$lib/store/managers/entities/message.svelte";
import { SERVER_EVENTS } from "@pingxy/shared/constants/index";
import type { SocketHandler } from "./index";

export const messageHandler: SocketHandler = {
  [SERVER_EVENTS.MESSAGES.CREATED]: (data) => {
    messageManager.handleIncomingMessage(data);
  },
};
