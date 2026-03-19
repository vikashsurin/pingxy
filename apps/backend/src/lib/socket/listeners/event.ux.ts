import { SERVER_EVENTS } from "@pingxy/shared/constants";
import { connectionManager } from "../connectionManager";

import { BusListener } from "./index";

export const uxListener: BusListener = {
  [SERVER_EVENTS.TYPING.STARTED]: async (data) => {
    connectionManager.publish(`inbox:${data.payload.userId}`, JSON.stringify(data));
  },
  [SERVER_EVENTS.PRESENCE.ONLINE]: async (data) => {
    connectionManager.publish(`inbox:${data.payload.for}`, JSON.stringify(data));
  },
  // [SERVER_EVENTS.PRESENCE.OFFLINE]: async (data) => {
  //   connectionManager.publish(`presence:${data.payload.userId}`, JSON.stringify(data));
  // },
};
