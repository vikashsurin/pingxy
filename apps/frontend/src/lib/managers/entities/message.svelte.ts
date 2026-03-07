import { messageApi } from "$lib/api/message.api";
import { messageStore } from "$lib/stores/messageStore.svelte";
import { type SERVER_EVENTS, type User } from "@pingxy/shared";
import { DOMAIN_EVENTS } from "@pingxy/shared/constants/index";
import type { ServerEventMap } from "@pingxy/shared/socket/types";
import { createClientReq } from "..";
import { chatStore } from "../../stores/store.svelte";
import { receiptManager } from "./receipt.svelte";

// export const loadInitialMessages = async ({
//   conversationId,
//   currentUserId,
//   limit,
// }: {
//   conversationId: number;
//   currentUserId: number;
//   limit: number;
// }) => {
//   if (!currentUserId || !conversationId) {
//     throw new Error("Invalid conversation or user ID");
//   }

//   try {
//     const data = await fetchMessages({
//       conversationId,
//       currentUserId,
//       limit,
//     });

//     virtualStore.absoluteLatestMessageId = data.chat.at(-1).message.messageId;
//     chatStore.messages[conversationId] = {};
//     for (const entry of data.chat) {
//       chatStore.messages[conversationId][entry.message.messageId] = entry;
//     }
//     return data;
//   } catch (error) {
//     chatStore.errorMessage =
//       error instanceof Error ? error.message : "Failed to load messages";
//     console.error("Load initial messages error:", error);
//     throw error;
//   }
// };

// export const sendMessage = async ({
//   messageText,
//   identifier,
//   partner,
// }: {
//   messageText: string;
//   identifier: string;
//   partner: User;
// }) => {
//   if (!identifier && !chatStore.currentUser) {
//     chatStore.errorMessage = "No identifier provided";
//     return;
//   }
//   const isExistingConv = identifier.startsWith("c_");
//   const idValue = Number(identifier.replace(/^[cu]_/, ""));

//   // const conversationId = chatStore.activeConversation.conversationId;

//   const envelope = createClientReq(DOMAIN_EVENTS.MESSAGES.CREATE, {
//     message: {
//       conversationId: isExistingConv ? idValue : null,
//       clientMessageId: crypto.randomUUID(),
//       content: messageText,
//       senderId: chatStore.currentUser?.id!,
//     },
//     conversationId: isExistingConv ? idValue : null,
//     sender: chatStore.currentUser!,
//     recipient: {
//       id: partner.id,
//       username: partner.username,
//     },
//   });

//   try {
//     const message = await messageApi.createMessage(envelope);
//     if (message) {
//       const { data } = message;
//       messageStore.upsertMessage(data.payload);
//     }

//     return null;
//   } catch (error) {
//     chatStore.setErrorMessage("Failed to send message");
//     console.error(error);
//     console.warn("Failed to send message!");
//   }
// };

// export const handleIncomingMessage = async (
//   data: ServerEventMap[typeof SERVER_EVENTS.MESSAGES.CREATED],
// ) => {
//   const { message, conversationId, sender, receipt } = data.payload;
//   const currentUserId = chatStore.currentUser?.id;

//   messageStore.upsertMessage(data.payload);

//   const isViewing = messageStore.activeChatId === conversationId;
//   const isFromMe = data.payload.message.senderId === currentUserId;
//   if (!isFromMe) {
//     if (isViewing) {
//       receiptManager.emitMarkRead({ message, userId: currentUserId! });
//     } else {
//       receiptManager.emitMarkDelivered({ message, userId: currentUserId! });

//       const chat = messageStore.chats.get(conversationId);
//       if (chat) chat.unreadCount += 1;
//     }
//   }
// };

// export const updateMessage = async () => {};
// export const deleteMessage = async () => {};

const createMessageManager = () => ({
  sendMessage: async ({
    messageText,
    attachments,
    identifier,
    partner,
  }: {
    messageText: string;
    attachments: any[] | null;
    identifier: string;
    partner: User;
  }) => {
    if (!identifier && !chatStore.currentUser) {
      chatStore.errorMessage = "No identifier provided";
      return;
    }
    const isExistingConv = identifier.startsWith("c_");
    const idValue = Number(identifier.replace(/^[cu]_/, ""));

    // const conversationId = chatStore.activeConversation.conversationId;

    const envelope = createClientReq(DOMAIN_EVENTS.MESSAGES.CREATE, {
      message: {
        conversationId: isExistingConv ? idValue : null,
        clientMessageId: crypto.randomUUID(),
        content: messageText,
        attachments: attachments,
        senderId: chatStore.currentUser?.id!,
      },
      conversationId: isExistingConv ? idValue : null,
      sender: chatStore.currentUser!,
      recipient: {
        id: partner.id,
        username: partner.username,
      },
    });

    console.log("envelope", envelope);

    try {
      const message = await messageApi.createMessage(envelope);
      if (message) {
        const { data } = message;
        messageStore.upsertMessage(data.payload);
      }

      return null;
    } catch (error) {
      chatStore.setErrorMessage("Failed to send message");
      console.error(error);
      console.warn("Failed to send message!");
    }
  },

  sendMedia: async ({
    identifier,
    partner,
  }: {
    identifier: string;
    partner: User;
  }) => {
    const isExistingConv = identifier.startsWith("c_");
    const idValue = Number(identifier.replace(/^[cu]_/, ""));
  },
  updateMessage: async () => {},

  deleteMessage: async () => {},

  handleIncomingMessage: async (
    data: ServerEventMap[typeof SERVER_EVENTS.MESSAGES.CREATED],
  ) => {
    const { message, conversationId, sender, receipt } = data.payload;
    const currentUserId = chatStore.currentUser?.id;

    messageStore.upsertMessage(data.payload);

    const isViewing = messageStore.activeChatId === conversationId;
    const isFromMe = data.payload.message.senderId === currentUserId;
    if (!isFromMe) {
      if (isViewing) {
        receiptManager.emitMarkRead({ message, userId: currentUserId! });
      } else {
        receiptManager.emitMarkDelivered({ message, userId: currentUserId! });

        const chat = messageStore.chats.get(conversationId);
        if (chat) chat.unreadCount += 1;
      }
    }
  },
});

export const messageManager = createMessageManager();
