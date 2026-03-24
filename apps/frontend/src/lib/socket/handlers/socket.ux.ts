import { SERVER_EVENTS } from "@pingxy/shared/constants/index";
import { uxManager } from "../../managers/entities/ux.svelte";
import type { SocketHandler } from "./index";

export const uxHandler: SocketHandler = {
  [SERVER_EVENTS.TYPING.STARTED]: (data) => {
    uxManager.handleTypingEvent(data);
  },

  [SERVER_EVENTS.PRESENCE.ONLINE]: (data) => {
    uxManager.handlePresenceEvent(data);
  },

  [SERVER_EVENTS.HEARTBEAT]: (data) => {
    uxManager.handleHeartbeatEvent(data);
  },
};
