import * as receiptManager from "$lib/store/managers/entities/receipt.svelte";
import { SERVER_EVENTS } from "@pingxy/shared/constants/index";
import type { SocketHandler } from "./index";

export const receiptHandler: SocketHandler = {
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
