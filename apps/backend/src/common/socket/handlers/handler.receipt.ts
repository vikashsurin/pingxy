import { ReceiptService } from "@modules/receipts";
import { DOMAIN_EVENTS } from "@pingxy/shared/constants";
import { SocketHandler } from "./index";

export const receiptHandler: SocketHandler = {
  [DOMAIN_EVENTS.RECEIPTS.ALL_READ]: async (socket, data) => {
    if (data.payload.conversationId && data.payload.userId) {
      await ReceiptService.processMarkAllRead(data);
    }
  },
  [DOMAIN_EVENTS.RECEIPTS.DELIVER]: async (socket, data) => {
    if (data.payload.conversationId && data.payload.userId) {
      console.log("message delivery request:: ", data);
      await ReceiptService.processDeliveryReceipt(data);
    }
  },
  [DOMAIN_EVENTS.RECEIPTS.READ]: async (socket, data) => {
    console.log("marking read receipts:: ", data);

    if (data.payload.conversationId && data.payload.userId) {
      await ReceiptService.processReadReceipt(data);
    }
  },
};
