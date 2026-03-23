import { receiptApi } from "$lib/api/receipt.api";
import { DOMAIN_EVENTS } from "@pingxy/shared/constants/index";
import { createClientReq } from "..";



const createReceiptManager = () => ({
  updateReceipt: async ({
    convId,
    lastReadMessageId,
    lastDeliveredMessageId,
    senderId
  }: {
    convId: number,
    lastReadMessageId?: number,
    lastDeliveredMessageId?: number,
    senderId: number
  }) => {

    const envelope = createClientReq(DOMAIN_EVENTS.PARTICIPANTS.UPDATE, {
      conversationId: convId,
      lastReadMessageId: lastReadMessageId,
      lastDeliveredMessageId: lastDeliveredMessageId,
      senderId: senderId
    })

    receiptApi.updateReceipt(envelope);

  },



});

export const receiptManager = createReceiptManager();
