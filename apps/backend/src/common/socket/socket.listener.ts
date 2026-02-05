import { eventBus, DOMAIN_EVENTS } from "@common/events";
import { publish } from "./pubsub";
import { ServerEventType, type ServerNewMessageType } from "@pingxy/shared/domain";


export function setupSocketListeners() {
  eventBus.on(DOMAIN_EVENTS.MESSAGES.SENT, (data: ServerEventType) => {
    switch (data.type) {
      case "message.new": {
        const recipient = data.payload.recipient;
        const conversationId = data.payload.conversationId;

        // Broadcast message
        publish(`${conversationId}`, JSON.stringify(data));

        // If the user is not subscribed
        // Notify of new message via inbox
        // Todo: verify if dedicated notifcation data to be sent
        publish(`inbox:${recipient.id}`, JSON.stringify(data));
        break
      }
      case "message.update": { }
      case "message.delete": { }
      case "users.online": { }
      case "receipt.update.status": {
      }
      default: { }
    }
  });
}
