import { SERVER_EVENTS } from "@pingxy/shared/socket";
import { BusListener } from ".";
import { publish } from "../pubsub";

export const messageListener: BusListener = {
  [SERVER_EVENTS.MESSAGES.CREATED]: async (data) => {
    const recipient = data.payload.recipient;
    const conversationId = data.payload.conversationId;
    // Broadcast message
    publish(`${conversationId}`, JSON.stringify(data));

    // If the user is not subscribed
    // Notify of new message via inbox
    // Todo: verify if dedicated notifcation data to be sent
    publish(`inbox:${recipient.id}`, JSON.stringify(data));
  },
};
