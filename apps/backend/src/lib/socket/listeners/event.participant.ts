import { SERVER_EVENTS } from "@pingxy/shared/constants";
import { connectionManager } from "../connectionManager";

import { BusListener } from "./index";

export const participantListener: BusListener = {
  [SERVER_EVENTS.PARTICIPANTS.UPDATED]: async (data) => {
    const { senderId } = data.payload;

    connectionManager.publish(`inbox:${senderId}`, JSON.stringify(data));
  },
};
