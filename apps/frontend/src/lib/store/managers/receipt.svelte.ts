import type { Message, MessageReceipt } from "@pingxy/shared/types/index";
import type { ClientMessageReceiptType } from "@pingxy/shared/domain/message-receipt/message-receipt.types";
import { getSocket } from "$lib/socket/socket.svelte";
import { chatStore } from "../store.svelte";

/**
 * Priority used to ensure we don't overwrite a 'read' status
 * with a late-arriving 'delivered' packet.
 */
const STATUS_PRIORITY: Record<MessageReceipt["status"], number> = {
  sent: 1,
  delivered: 2,
  read: 3,
};

type ReceiptParams = {
  message: Message;
  user_id: number;
};

// --- OUTBOUND: EMITTERS (Client -> Server) ---
// These are treeshakeable named exports.
// Use 'emit' prefix for anything sending a socket packet.

export const emitMarkSent = async () => {
  // Logic for local UI transition if needed
};

export const emitMarkRead = async ({ message, user_id }: ReceiptParams) => {
  const socket = validateSocket();
  if (!socket) return;

  const payload: ClientMessageReceiptType = {
    type: "receipt.read",
    id: crypto.randomUUID(),
    payload: {
      conversation_id: message.conversation_id,
      message_id: message.message_id,
      user_id: user_id,
      recipient: { id: message.sender_id },
    },
  };

  socket.send(JSON.stringify(payload));
};

export const emitMarkDelivered = async ({
  message,
  user_id,
}: ReceiptParams) => {
  const socket = validateSocket();
  if (!socket) return;

  const payload: ClientMessageReceiptType = {
    id: crypto.randomUUID(),
    type: "receipt.delivered",
    payload: {
      conversation_id: message.conversation_id,
      message_id: message.message_id,
      user_id: user_id,
      recipient: { id: message.sender_id },
    },
  };
  socket.send(JSON.stringify(payload));
};

export const emitMarkAllRead = async ({
  conversation_id,
  currentUser_id,
  recipient_id,
}: {
  conversation_id: number;
  currentUser_id: number;
  recipient_id: number;
}) => {
  const socket = validateSocket();
  if (!socket || !chatStore.currentUser) return;

  const payload: ClientMessageReceiptType = {
    type: "receipts.mark_all_read",
    id: crypto.randomUUID(),
    payload: {
      conversation_id,
      user_id: currentUser_id,
      recipient: { id: recipient_id },
    },
  };

  socket.send(JSON.stringify(payload));
};

// --- INBOUND: HANDLERS (Server -> Client) ---
// Use 'handle' prefix for functions that process incoming socket data.

/**
 * Entry point for the socket message listener.
 * Called when 'receipt' type events arrive.
 */
export const handleIncomingReceipts = (receipts: MessageReceipt[]) => {
  for (const receipt of receipts) {
    applyReceiptUpdateToStore(receipt);
  }
};

// --- PRIVATE HELPERS ---
// These are not exported, so they will be bundled only if the
// exported functions above are used.

function validateSocket() {
  const socket = getSocket();
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn("WebSocket not ready");
    return null;
  }
  return socket;
}

/**
 * Central logic for updating the chatStore.
 * Prevents "Status Regressions" (e.g., delivered arriving after read).
 */
function applyReceiptUpdateToStore(receipt: MessageReceipt) {
  const entry = chatStore.getEntry(receipt.conversation_id, receipt.message_id);

  if (!entry) {
    console.warn(`Message not found: ${receipt.message_id}`);
    return;
  }

  const currentStatus = entry.receipt.status;
  const newStatus = receipt.status;

  // Update only if the new status is a higher priority
  if (STATUS_PRIORITY[newStatus] > STATUS_PRIORITY[currentStatus]) {
    entry.receipt = receipt;
  } else if (newStatus === "read") {
    // "Read" is terminal; always ensure it is applied if received
    entry.receipt = receipt;
  }
}
