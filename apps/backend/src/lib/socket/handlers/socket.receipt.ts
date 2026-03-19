import { ReceiptService } from "@modules/receipts";
import { DOMAIN_EVENTS } from "@pingxy/shared/constants";
import { SocketHandler } from "./index";

export const receiptHandler: SocketHandler = {
  [DOMAIN_EVENTS.RECEIPTS.DELIVER]: async (socket, data) => {
    if (data.payload.conversationId && data.payload.readerId) {
      await ReceiptService.processDeliveryReceipt(data);
    }
  },
  [DOMAIN_EVENTS.RECEIPTS.READ]: async (socket, data) => {

    if (data.payload.conversationId && data.payload.readerId) {
      await ReceiptService.processReadReceipt(data);
    }
  },
  [DOMAIN_EVENTS.RECEIPTS.ALL_READ]: async (socket, data) => {
    if (data.payload.conversationId && data.payload.readerId) {
      await ReceiptService.processMarkAllRead(data);
    }
  },
};
