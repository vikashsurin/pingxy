import { receiptApi } from "$lib/api/receipt.api";
import { receiptStore } from "$lib/stores/receiptStore.svelte";
import { DOMAIN_EVENTS } from "@pingxy/shared/constants/index";
import type {
  MessageReceipt
} from "@pingxy/shared/types/index";
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

    console.log({
      convId,
      lastReadMessageId,
      lastDeliveredMessageId,
      senderId
    })

    const envelope = createClientReq(DOMAIN_EVENTS.PARTICIPANTS.UPDATE, {
      conversationId: convId,
      lastReadMessageId: lastReadMessageId,
      lastDeliveredMessageId: lastDeliveredMessageId,
      senderId: senderId
    })

    receiptApi.updateReceipt(envelope);

  },


  // redundant
  handleIncomingReceipts: (receipts: MessageReceipt[]) => {
    for (const receipt of receipts) {
      receiptStore.upsertReceipt(receipt);
    }
  },
});

export const receiptManager = createReceiptManager();
