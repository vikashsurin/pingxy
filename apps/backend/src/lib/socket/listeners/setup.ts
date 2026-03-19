import { blockListener } from "./event.block";
import { messageListener } from "./event.message";
import { receiptListener } from "./event.receipt";
import { userListener } from "./event.user";
import { uxListener } from "./event.ux";
import { registerBusListeners } from "./register";

export function setupSocketListeners() {
  registerBusListeners(
    messageListener,
    receiptListener,
    userListener,
    blockListener,
    uxListener
  );
}
