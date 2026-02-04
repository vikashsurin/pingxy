import type {
  Message,
  MessageReceipt,
  User,
} from "@pingxy/shared/types/index";
import type { ClientMessageReceiptType } from "@pingxy/shared/domain/message-receipt/message-receipt.types";

import { getSocket } from "$lib/socket/socket.svelte";
import { chatStore } from "../store.svelte";
import { conn } from "$lib/utils/conn";


/**
 * Receipt status hierarchy for comparison
 */
const RECEIPT_STATUS_PRIORITY: Record<MessageReceipt["status"], number> = {
  // 'sending': 0,
  sent: 1,
  delivered: 2,
  read: 3,
};

/**
 * Check if new status is more advanced than current status
 */
function isMoreAdvancedStatus(
  currentStatus: MessageReceipt["status"],
  newStatus: MessageReceipt["status"],
): boolean {
  return (
    RECEIPT_STATUS_PRIORITY[newStatus] > RECEIPT_STATUS_PRIORITY[currentStatus]
  );
}

/**
 * Handlers for different receipt types
 * Called when receipt updates arrive via WebSocket
 */
export const receiptHandlers: Record<
  string,
  (receipt: MessageReceipt) => void
> = {
  delivered: (receipt) => {
    const entry = chatStore.getEntry(
      receipt.conversation_id,
      receipt.message_id,
    );

    if (!entry) {
      console.warn(
        `Message not found: conv=${receipt.conversation_id}, msg=${receipt.message_id}`,
      );
      return;
    }

    // Only update if new status is more advanced
    if (isMoreAdvancedStatus(entry.receipt.status, "delivered")) {
      chatStore.updateReceipt(receipt);
    }
  },

  read: (receipt) => {
    const entry = chatStore.getEntry(
      receipt.conversation_id,
      receipt.message_id,
    );

    if (!entry) {
      console.warn(
        `Message not found: conv=${receipt.conversation_id}, msg=${receipt.message_id}`,
      );
      return;
    }

    // Read status always updates (highest priority)
    chatStore.updateReceipt(receipt);
  },

  sent: (receipt) => {
    const entry = chatStore.getEntry(
      receipt.conversation_id,
      receipt.message_id,
    );

    if (!entry) {
      console.warn(
        `Message not found: conv=${receipt.conversation_id}, msg=${receipt.message_id}`,
      );
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


export async function initChat(user: User) {
  // find a conversation id
  const currentUserId: number = chatStore.currentUser?.id!
  const userId: number = user.id

  const response = await fetch(`/api/conversations/${currentUserId}/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  console.log({ data })

  chatStore.activeConversation = {
    conversation_id: data.conversation.conversation_id,
    user: user
  }
}


export const receiptManager = {
  markAsDelivered: async ({
    message,
    user_id,
  }: {
    message: Message;
    user_id: number;
  }) => {
    const socket = getSocket();

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not ready, cannot mark as delivered");
      return;
    }

    const msgPayload: ClientMessageReceiptType = {
      id: crypto.randomUUID(),
      type: "receipt.delivered",
      payload: {
        conversation_id: message.conversation_id,
        message_id: message.message_id,
        user_id: user_id,
        recipient: {
          id: message.sender_id,
        },
      },
    };
    socket.send(JSON.stringify(msgPayload));
  },

  markAsRead: async ({
    message,
    user_id,
  }: {
    message: Message;
    user_id: number;
  }) => {
    const socket = getSocket();

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not ready, cannot mark as read");
      return;
    }

    const msgPayload: ClientMessageReceiptType = {
      type: "receipt.read",
      id: crypto.randomUUID(),
      payload: {
        conversation_id: message.conversation_id,
        message_id: message.message_id,
        user_id: user_id,
        recipient: {
          id: message.sender_id,
        },
      },
    };

    socket.send(JSON.stringify(msgPayload));
  },


  markAllAsRead: async ({ conversation_id, recipient_id }: { conversation_id: number, recipient_id: number }) => {
    const socket = getSocket();

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not ready, cannot mark all as read");
      return;
    }

    if (!chatStore.activeConversation || !chatStore.currentUser) {
      console.warn("No active conversation or user");
      return;
    }


    const msgPayload: ClientMessageReceiptType = {
      type: "receipts.mark_all_read",
      id: crypto.randomUUID(),
      payload: {
        conversation_id: conversation_id,
        user_id: chatStore.currentUser.id,
        recipient: {
          id: recipient_id,
        },
      },
    };

    socket.send(JSON.stringify(msgPayload));
  },

  handleReceiptUpdate: (receipts: MessageReceipt[]) => {
    for (const receipt of receipts) {
      const handler = receiptHandlers[receipt.status];

      handler ? handler(receipt) : console.warn(`Missing: ${receipt.status}`);
    }
  },

}
