import { SERVER_EVENTS } from "@pingxy/shared/constants";
import { BusListener } from "./index";
import { publish } from "../pubsub";
import { userSockets } from "../state/socketState";

export const userListener: BusListener = {
  [SERVER_EVENTS.USERS.CONNECTED]: async (data) => {
    publish(":server", JSON.stringify(data));
  },
  [SERVER_EVENTS.USERS.DISCONNECTED]: async (data) => {
    publish(":server", JSON.stringify(data));
  },
  [SERVER_EVENTS.USERS.LOGIN]: async (data) => {
    publish(":server", JSON.stringify(data));
  },
  [SERVER_EVENTS.USERS.LOGOUT]: async (data) => {
    userSockets.delete(data.payload.user.id);

    publish(":server", JSON.stringify(data));
  },
};
