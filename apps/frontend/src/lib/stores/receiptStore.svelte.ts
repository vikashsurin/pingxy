import { SvelteMap } from "svelte/reactivity";

class ReceiptStore {
  receipts = new SvelteMap<number, any>();

  upsertReceipt(receipt: any) {
    if (!receipt?.messageId) return;

    const existing = this.receipts.get(receipt.messageId);

    // Optimization: Only update if the new status is "more advanced"
    if (existing?.status === "read" && receipt.status !== "read") {
      return;
    }

    // Correct way to update a Map: you MUST use .set()
    this.receipts.set(receipt.messageId, receipt);
  }

  setReceipts(items: any[]) {
    for (const item of items) {
      this.receipts.set(item.messageId, item);
    }
  }
}

export const receiptStore = new ReceiptStore();
