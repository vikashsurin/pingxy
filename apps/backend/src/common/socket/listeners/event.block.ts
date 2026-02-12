import { SERVER_EVENTS } from "@pingxy/shared/constants";
import { publish } from "../pubsub";
import { BusListener } from "./index";

export const blockListener: BusListener = {
  [SERVER_EVENTS.BLOCKS.UNBLOCKED]: async (data) => {
    publish(":server", JSON.stringify(data));
  },
};
