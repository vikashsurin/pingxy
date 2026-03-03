import { SERVER_EVENTS } from "@pingxy/shared/constants";
import { publish } from "../pubsub";
import { BusListener } from "./index";

export const uxListener: BusListener = {
  [SERVER_EVENTS.TYPING.STARTED]: async (data) => {
    publish(`inbox:${data.payload.userId}`, JSON.stringify(data));
  },
};
