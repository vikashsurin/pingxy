import { SERVER_EVENTS } from "@pingxy/shared/constants";
import { connectionManager } from "../connectionManager";

import { BusListener } from "./index";

export const blockListener: BusListener = {
  [SERVER_EVENTS.BLOCKS.UNBLOCKED]: async (data) => {
    connectionManager.publish(":server", JSON.stringify(data));
  },
};
