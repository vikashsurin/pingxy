import { messageListener } from "./listener.message";
import { receiptListener } from "./listener.receipt";
import { userListener } from "./listener.user";
import { registerBusListeners } from "./register";

export function setupSocketListeners() {
  registerBusListeners(messageListener, receiptListener, userListener);
}
