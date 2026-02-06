import { type SocketHandlers } from "@pingxy/shared";
import * as receiptManager from "$lib/store/managers/receipt.svelte";

export const receiptHandler: SocketHandlers = {
  "receipt.read": (data) => {
    const receipts = data.payload.receipts;
    if (!receipts) return;
    receiptManager.handleIncomingReceipts(receipts);
  },

//   "receipt.mark_all_read": (data) => {},
};
