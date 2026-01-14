import { type Message, type MessagePayload, type MessageReceipt } from "@chat/shared/src/lib/utils/validation";
import { getSocket } from "./socket.svelte";
import { chatStore } from "./store.svelte";

export async function markAsDelivered({
  message,
  user_id }: {
    message: Message,
    user_id: number
  }) {
  const socket = getSocket()
  if (socket && socket.readyState === WebSocket.OPEN) {
    const msgPayload: MessagePayload = {
      type: "mark_as_delivered",
      id: crypto.randomUUID(),
      recipient: {
        id: message.sender_id
      },
      data: {
        conversation_id: message.conversation_id,
        message_id: message.message_id,
        user_id: user_id,
      },
    };
    socket.send(JSON.stringify(msgPayload));
  }
}

export async function markAsRead({
  message,
  user_id }: {
    message: Message,
    user_id: number
  }) {
  const socket = getSocket()
  if (socket && socket.readyState === WebSocket.OPEN) {
    const msgPayload: MessagePayload = {
      type: "mark_as_read",
      id: crypto.randomUUID(),
      recipient: {
        id: message.sender_id
      },
      data: {
        conversation_id: message.conversation_id,
        message_id: message.message_id,
        user_id: user_id,
      },
    };
    socket.send(JSON.stringify(msgPayload));
  }
}


export async function markAllAsRead(recipient_id: number) {
  const socket = getSocket()
  if (socket && socket.readyState === WebSocket.OPEN) {
    const msgPayload: MessagePayload = {
      type: "mark_all_as_read",
      id: crypto.randomUUID(),
      recipient: {
        id: recipient_id,
      },
      data: {
        conversation_id:
          chatStore.activeConversation?.conversation_id!,
        user_id: chatStore.currentUser?.id!,
      },
    };
    socket.send(JSON.stringify(msgPayload));
  }
}

function getEntry(receipt: MessageReceipt) {
  const conv = chatStore.messages[receipt.conversation_id];
  const entry = conv?.[receipt.message_id];
  return entry;
}


export const receiptHandlers: Record<string, (receipt: MessageReceipt) => void> = {
  'delivered': (receipt) => {
    // Only update if current status is less advanced
    const entry = getEntry(receipt);
    if (entry && ['sent', 'sending'].includes(entry.receipt.status)) {
      entry.receipt = { ...receipt };
    }
  },
  'read': (receipt) => {
    const entry = getEntry(receipt);
    if (entry) {
      entry.receipt = { ...receipt }; // Always update read status
    }
  }
};


// export async function loadMessageOnScroll({
//   conversation_id,
//   before,
//   after,
//   limit }: {
//     conversation_id: number,
//     before?: number,
//     after?: number,
//     limit?: number
//   }) {
//   const MAX_MESSAGES_IN_MEMORY = 100;
//   const user_id = chatStore.currentUser?.id!;
//   const response = await fetch(
//     `http://localhost:3000/api/conversations/${conversation_id}/messages/${user_id}?before=${before}&after=${after}&limit=${limit}`,
//     {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       credentials: "include",
//     },
//   );
//   const data = await response.json();

//   const newRawMessages = [...data.result, ...chatStore.flatMessages]
//   chatStore.rawMessages = newRawMessages;
//   chatStore.buildNestedMap(chatStore.rawMessages)

//   if (newRawMessages.length > MAX_MESSAGES_IN_MEMORY) {
//     const excess = newRawMessages.length - MAX_MESSAGES_IN_MEMORY;
//     chatStore.rawMessages = newRawMessages.slice(0, -excess);
//     chatStore.buildNestedMap(chatStore.rawMessages);
//   }

//   return data.hasMore;
// }
