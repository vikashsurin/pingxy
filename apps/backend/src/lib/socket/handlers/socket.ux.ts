import { UXService } from "@modules/ux/ux.service";
import { DOMAIN_EVENTS } from "@pingxy/shared/constants";
import { SocketHandler } from "./index";


export const uxHandler: SocketHandler = {
  [DOMAIN_EVENTS.TYPING.START]: async (socket, data) => {
    UXService.typingStart(data.payload.conversationId, data.payload.userId);
  },
  [DOMAIN_EVENTS.PRESENCE.ONLINE]: async (socket, data) => {
    UXService.presence(data.payload.of, data.payload.for, data.payload.conversationId);
  },
};
