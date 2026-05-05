import { blockListener } from "./event.block";
import { conversationListener } from "./event.conversation";
import { messageListener } from "./event.message";
import { participantListener } from "./event.participant";
import { userListener } from "./event.user";
import { uxListener } from "./event.ux";
import { registerBusListeners } from "./register";


export function setupSocketListeners() {
  registerBusListeners(
    conversationListener,
    messageListener,
    userListener,
    blockListener,
    participantListener,
    uxListener,
  );
}
