import type { ClientReqMap } from "@pingxy/shared";

export const createReceiptApi = (customFetch: typeof fetch = fetch) => {
  async function updateReceipt(envelope: ClientReqMap["req:participant.update"]) {
    // const receiptId: number = envelope.payload.id;

    const res = await customFetch(`/api/participants`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        ...envelope,
      }),
    });

    if (!res.ok) throw new Error("Failed to send receipt");

    return await res.json();
  }


  async function upateReceiptsToRead(envelope: ClientReqMap["req:receipts.update.all"]) {
    const res = await customFetch(`/api/receipts/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        ...envelope,
      }),
    })

    return await res.json();
  }
  return {
    updateReceipt,
    upateReceiptsToRead
  };
};

export const receiptApi = createReceiptApi();
