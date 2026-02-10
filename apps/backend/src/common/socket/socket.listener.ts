// import { eventBus } from "@common/events";
// import { SERVER_EVENTS, ServerEventMap } from "@pingxy/shared/socket";
// import { publish } from "./pubsub";

// export function setupSocketListeners() {
//   eventBus.on(
//     SERVER_EVENTS.MESSAGES.CREATED,
//     (data: ServerEventMap[typeof SERVER_EVENTS.MESSAGES.CREATED]) => {
//       const recipient = data.payload.recipient;
//       const conversationId = data.payload.conversationId;
//       // Broadcast message
//       publish(`${conversationId}`, JSON.stringify(data));

//       // If the user is not subscribed
//       // Notify of new message via inbox
//       // Todo: verify if dedicated notifcation data to be sent
//       publish(`inbox:${recipient.id}`, JSON.stringify(data));
//     },
//   );

//   eventBus.on(
//     SERVER_EVENTS.RECEIPTS.DELIVERED,
//     (data: ServerEventMap[typeof SERVER_EVENTS.RECEIPTS.DELIVERED]) => {
//       publish(`inbox:${data.payload.recipient.id}`, JSON.stringify(data));
//     },
//   );

//   eventBus.on(
//     SERVER_EVENTS.RECEIPTS.READ,
//     (data: ServerEventMap[typeof SERVER_EVENTS.RECEIPTS.READ]) => {
//       publish(`inbox:${data.payload.recipient.id}`, JSON.stringify(data));
//     },
//   );

//   eventBus.on(
//     SERVER_EVENTS.RECEIPTS.ALL_READ,
//     (data: ServerEventMap[typeof SERVER_EVENTS.RECEIPTS.ALL_READ]) => {
//       publish(`inbox:${data.payload.recipient.id}`, JSON.stringify(data));
//     },
//   );
// }
