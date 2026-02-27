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
    readerId: userId,
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
      readerId: userId,
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
      readerId: currentuserId,
      sender: { id: senderId },
    },
  };

  socket.send(JSON.stringify(payload));

  resetUnreadCount(conversationId);
};


export const handleIncomingReceipts = (receipts: MessageReceipt[]) => {
  for (const receipt of receipts) {
    messageStore.updateReceipt({
      msgId: receipt.messageId,
      newReceipt: receipt,
    });
  }
};
