import { SERVER_EVENTS } from "@pingxy/shared/socket";
import { BusListener } from ".";
import { connectionManager } from "../connectionManager";

export const messageListener: BusListener = {
  [SERVER_EVENTS.MESSAGES.CREATED]: async (data) => {
    const recipient = data.payload.recipient;
    // Broadcast message
    //connectionManager.publish(`${conversationId}`, JSON.stringify(data));

    // If the user is not subscribed
    // Notify of new message via inbox
    // Todo: verify if dedicated notifcation data to be sent
    connectionManager.publish(`inbox:${recipient.id}`, JSON.stringify(data));
    //connectionManager.publish(`inbox:${recipient.id}`, JSON.stringify(data))
  },
};
