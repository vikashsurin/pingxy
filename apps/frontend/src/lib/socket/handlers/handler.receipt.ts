import * as receiptManager from "$lib/store/managers/receipt.svelte";
import { SERVER_EVENTS } from "@pingxy/shared/constants/index";
import { type SocketHandlers } from "@pingxy/shared/socket/types";

export const receiptHandler: SocketHandlers = {
  [SERVER_EVENTS.RECEIPTS.DELIVERED]: (data) => {
    const receipts = data.payload.receipts;

    if (!receipts) return;
    receiptManager.handleIncomingReceipts(receipts);
  },
  [SERVER_EVENTS.RECEIPTS.READ]: (data) => {
    const receipts = data.payload.receipts;

    if (!receipts) return;
    receiptManager.handleIncomingReceipts(receipts);
  },
  [SERVER_EVENTS.RECEIPTS.ALL_DELIVERED]: (data) => {
    const receipts = data.payload.receipts;

    if (!receipts) return;
    receiptManager.handleIncomingReceipts(receipts);
  },
  [SERVER_EVENTS.RECEIPTS.ALL_READ]: (data) => {
    const receipts = data.payload.receipts;

    if (!receipts) return;
    receiptManager.handleIncomingReceipts(receipts);
  },
};
