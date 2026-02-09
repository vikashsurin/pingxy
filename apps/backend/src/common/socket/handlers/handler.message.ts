import { DOMAIN_EVENTS } from "@pingxy/shared/constants";
import { SocketHandler } from "./index";

export const messageHandler: SocketHandler = {
  [DOMAIN_EVENTS.MESSAGES.CREATE]: async (socket, data) => {},
};
