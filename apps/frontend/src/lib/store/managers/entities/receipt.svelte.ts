import { validateSocket } from "$lib/store/helpers";
import { DOMAIN_EVENTS } from "@pingxy/shared/constants/index";
import type {
  Message,
  MessageReceipt,
  ReceiptRequestType,
} from "@pingxy/shared/types/index";
import { createClientReq } from "..";
import { chatStore, type ChatEntry } from "../../store.svelte";
import { resetUnreadCount } from "./conversation.svelte";
import { messageStore } from "$lib/store/messageStore.svelte";

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
  userId: number;
};

export const emitMarkSent = async () => {
  // Logic for local UI transition if needed
};

export const emitMarkRead = async ({ message, userId }: ReceiptParams) => {
  const socket = validateSocket();
  if (!socket) return;

  const payload = createClientReq(DOMAIN_EVENTS.RECEIPTS.READ, {
    conversationId: message.conversationId,
    messageId: message.messageId,
    userId: userId,
    sender: { id: message.senderId },
  });
  socket.send(JSON.stringify(payload));
};

export const emitMarkDelivered = async ({ message, userId }: ReceiptParams) => {
  const socket = validateSocket();
  if (!socket) return;

  const payload: ReceiptRequestType = {
    id: crypto.randomUUID(),
    type: DOMAIN_EVENTS.RECEIPTS.DELIVER,
    payload: {
      conversationId: message.conversationId,
      messageId: message.messageId,
      userId: userId,
      sender: { id: message.senderId },
    },
  };
  socket.send(JSON.stringify(payload));
};

export const emitMarkAllRead = async ({
  conversationId,
  currentuserId,
  senderId,
}: {
  conversationId: number;
  currentuserId: number;
  senderId: number;
}) => {
  const socket = validateSocket();
  if (!socket || !chatStore.currentUser) return;

  const payload: ReceiptRequestType = {
    type: DOMAIN_EVENTS.RECEIPTS.ALL_READ,
    id: crypto.randomUUID(),
    payload: {
      conversationId,
      userId: currentuserId,
      sender: { id: senderId },
    },
  };

  socket.send(JSON.stringify(payload));

  resetUnreadCount(conversationId);
};

// export const handleIncomingReceipts = (receipts: MessageReceipt[]) => {
//   const hasMessage = () => {
//     for (const _ in chatStore.messages) return true;
//     return false;
//   };

//   if (hasMessage()) {
//     for (const receipt of receipts) {
//       const messages = chatStore.messages[receipt.conversationId];
//       console.log({ messages: $state.snapshot(messages) });
//       if (messages && messages[receipt.messageId]) {
//         applyReceiptUpdateToStore(messages[receipt.messageId], receipt);
//       }
//     }
//   }
// };
// export const handleIncomingReceipts = (receipts: MessageReceipt[]) => {
//   for (const receipt of receipts) {
//     const conversationMessages = chatStore.messages[receipt.conversationId];

//     // If we have the messages, update them immediately
//     if (conversationMessages && conversationMessages[receipt.messageId]) {
//       applyReceiptUpdateToStore(
//         conversationMessages[receipt.messageId],
//         receipt,
//       );
//     }
//     // If we don't have them yet, store the receipt in a buffer
//     else {
//       if (!chatStore.pendingReceipts[receipt.conversationId]) {
//         chatStore.pendingReceipts[receipt.conversationId] = [];
//       }
//       chatStore.pendingReceipts[receipt.conversationId].push(receipt);
//     }
//   }
// };

// function applyReceiptUpdateToStore(entry: ChatEntry, receipt: MessageReceipt) {
//   const currentStatus = entry.receipt.status;
//   const newStatus = receipt.status;

//   // Update only if the new status is a higher priority
//   if (STATUS_PRIORITY[newStatus] > STATUS_PRIORITY[currentStatus]) {
//     entry.receipt = receipt;
//   } else if (newStatus === "read") {
//     entry.receipt = receipt;
//   }
// }

export const handleIncomingReceipts = (receipts: MessageReceipt[]) => {
  for (const receipt of receipts) {
    messageStore.updateReceipt({
      msgId: receipt.messageId,
      newReceipt: receipt,
    });
  }
};
