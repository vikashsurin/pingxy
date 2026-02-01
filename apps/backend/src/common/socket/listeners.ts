import { eventBus, DOMAIN_EVENTS } from "@common/events";
import { publish } from "./pubsub";
import { type ServerEventType } from "@pingxy/shared/ws";


export function setupSocketListeners() {
  eventBus.on(DOMAIN_EVENTS.MESSAGES.SENT, (data: ServerEventType) => {
    switch (data.type) {
      case "message.new": {
        const recipient = data.payload.recipient;
        const conversationId = data.payload.conversation_id;

        // Broadcast message
        publish(`${conversationId}`, JSON.stringify(data));

        // If the user is not subscribed
        // Notify of new message via inbox
        // Todo: verify if dedicated notifcation data to be sent
        publish(`inbox:${recipient.id}`, JSON.stringify(data));
      }
      case "message.update": { }
      case "message.delete": { }
      default: { }
    }
  });
}
