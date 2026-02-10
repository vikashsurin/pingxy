import { messageListener } from "./event.message";
import { receiptListener } from "./event.receipt";
import { userListener } from "./event.user";
import { registerBusListeners } from "./register";

export function setupSocketListeners() {
  registerBusListeners(messageListener, receiptListener, userListener);
}
