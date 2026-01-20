import { type Message, type MessagePayload, type MessageReceipt } from "@chat/shared/src/lib/utils/validation";
import { getSocket } from "../socket.svelte";
import { chatStore } from "./store.svelte";

/**
 * Mark a message as delivered via WebSocket
 */
export async function markAsDelivered({
  message,
  user_id
}: {
  message: Message;
  user_id: number;
}) {
  const socket = getSocket();

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn("WebSocket not ready, cannot mark as delivered");
    return;
  }

  const msgPayload: MessagePayload = {
    type: "mark_as_delivered",
    id: crypto.randomUUID(),
    recipient: {
      id: message.sender_id,
    },
    data: {
      conversation_id: message.conversation_id,
      message_id: message.message_id,
      user_id: user_id,
    },
  };

  socket.send(JSON.stringify(msgPayload));
}

/**
 * Mark a message as read via WebSocket
 */
export async function markAsRead({
  message,
  user_id
}: {
  message: Message;
  user_id: number;
}) {
  const socket = getSocket();

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn("WebSocket not ready, cannot mark as read");
    return;
  }

  const msgPayload: MessagePayload = {
    type: "mark_as_read",
    id: crypto.randomUUID(),
    recipient: {
      id: message.sender_id,
    },
    data: {
      conversation_id: message.conversation_id,
      message_id: message.message_id,
      user_id: user_id,
    },
  };

  socket.send(JSON.stringify(msgPayload));
}

/**
 * Mark all messages in the active conversation as read
 */
export async function markAllAsRead(recipient_id: number) {
  const socket = getSocket();

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn("WebSocket not ready, cannot mark all as read");
    return;
  }

  if (!chatStore.activeConversation || !chatStore.currentUser) {
    console.warn("No active conversation or user");
    return;
  }

  const msgPayload: MessagePayload = {
    type: "mark_all_as_read",
    id: crypto.randomUUID(),
    recipient: {
      id: recipient_id,
    },
    data: {
      conversation_id: chatStore.activeConversation.conversation_id,
      user_id: chatStore.currentUser.id,
    },
  };

  socket.send(JSON.stringify(msgPayload));
}

/**
 * Receipt status hierarchy for comparison
 */
const RECEIPT_STATUS_PRIORITY: Record<MessageReceipt['status'], number> = {
  // 'sending': 0,
  'sent': 1,
  'delivered': 2,
  'read': 3,
};

/**
 * Check if new status is more advanced than current status
 */
function isMoreAdvancedStatus(
  currentStatus: MessageReceipt['status'],
  newStatus: MessageReceipt['status']
): boolean {
  return RECEIPT_STATUS_PRIORITY[newStatus] > RECEIPT_STATUS_PRIORITY[currentStatus];
}

/**
 * Handlers for different receipt types
 * Called when receipt updates arrive via WebSocket
 */
export const receiptHandlers: Record<string, (receipt: MessageReceipt) => void> = {
  'delivered': (receipt) => {
    const entry = chatStore.getEntry(receipt.conversation_id, receipt.message_id);

    if (!entry) {
      console.warn(`Message not found: conv=${receipt.conversation_id}, msg=${receipt.message_id}`);
      return;
    }

    // Only update if new status is more advanced
    if (isMoreAdvancedStatus(entry.receipt.status, 'delivered')) {
      chatStore.updateReceipt(receipt);
    }
  },

  'read': (receipt) => {
    const entry = chatStore.getEntry(receipt.conversation_id, receipt.message_id);

    if (!entry) {
      console.warn(`Message not found: conv=${receipt.conversation_id}, msg=${receipt.message_id}`);
      return;
    }

    // Read status always updates (highest priority)
    chatStore.updateReceipt(receipt);
  },

  'sent': (receipt) => {
    const entry = chatStore.getEntry(receipt.conversation_id, receipt.message_id);

    if (!entry) {
      console.warn(`Message not found: conv=${receipt.conversation_id}, msg=${receipt.message_id}`);
      return;
    }

    // Only update if current status is 'sending'
    // if (entry.receipt.status === 'sending') {
    //   chatStore.updateReceipt(receipt);
    // }

    chatStore.updateReceipt(receipt);

  },
};

/**
 * Process incoming receipt update
 * Call this from your WebSocket message handler
 */
export function handleReceiptUpdate(receipt: MessageReceipt) {
  const handler = receiptHandlers[receipt.status];

  if (handler) {
    handler(receipt);
  } else {
    console.warn(`Unknown receipt status: ${receipt.status}`);
  }
}
