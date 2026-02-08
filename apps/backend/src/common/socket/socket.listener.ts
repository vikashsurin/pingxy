import { eventBus } from "@common/events";

import {
  DOMAIN_EVENTS,
  SERVER_EVENTS,
  SocketEventMap,
} from "@pingxy/shared/socket";
import { publish } from "./pubsub";

export function setupSocketListeners() {
  eventBus.on(
    SERVER_EVENTS.MESSAGES.CREATED,
    (data: SocketEventMap["event:message.created"]) => {
      const recipient = data.payload.recipient;
      const conversationId = data.payload.conversationId;

      // Broadcast message
      publish(`${conversationId}`, JSON.stringify(data));

      // If the user is not subscribed
      // Notify of new message via inbox
      // Todo: verify if dedicated notifcation data to be sent
      publish(`inbox:${recipient.id}`, JSON.stringify(data));
    },
  );
  // eventBus.on(DOMAIN_EVENTS.MESSAGES.CREATED, (data: ServerEventType) => {
  // const recipient = data.payload.recipient;
  // const conversationId = data.payload.conversationId;
}

// eventBus.on(DOMAIN_EVENTS.RECEIPTS.SENT, (data) => {});
// eventBus.on(DOMAIN_EVENTS.RECEIPTS.DELIVERED, (data) => {});
// eventBus.on(DOMAIN_EVENTS.RECEIPTS.READ, (data) => {});
// eventBus.on(DOMAIN_EVENTS.RECEIPTS.FAILED, (data) => {});
// eventBus.on(DOMAIN_EVENTS.RECEIPTS.ALL_DELIVERED, (data) => {});
// eventBus.on(DOMAIN_EVENTS.RECEIPTS.ALL_READ, (data) => {});
