import { messageApi } from "$lib/api/message.api";
import { messageStore } from "$lib/stores/messageStore.svelte";
import {
  messageCreatedSchema,
  type SERVER_EVENTS,
  type User,
} from "@pingxy/shared";
import { DOMAIN_EVENTS } from "@pingxy/shared/constants/index";
import type { ServerEventMap } from "@pingxy/shared/socket/types";
import { createClientReq } from "..";
import { chatStore } from "../../stores/store.svelte";
import { receiptManager } from "./receipt.svelte";
import type {
  attachmentInsertSchema,
  attachmentResponseSchema,
} from "@pingxy/shared/domain/attachment/attachment.schema";
import { z } from "zod";


const createMessageManager = () => ({
  sendMessage: async ({
    messageText,
    attachments,
    identifier,
    partner,
  }: {
    messageText: string;
    attachments: z.infer<typeof attachmentInsertSchema>[];
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
        senderId: chatStore.currentUser?.id!,
      },
      attachments: attachments,
      conversationId: isExistingConv ? idValue : null,
      sender: chatStore.currentUser!,
      recipient: {
        id: partner.id,
        username: partner.username,
      },
    });

    try {
      const message = await messageApi.createMessage(envelope);
      if (message) {
        const { data }: { data: z.infer<typeof messageCreatedSchema> } =
          message;
        chatStore.upsertEntity(data.payload);
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
  updateMessage: async () => { },

  deleteMessage: async () => { },

  handleIncomingMessage: async (
    data: ServerEventMap[typeof SERVER_EVENTS.MESSAGES.CREATED],
  ) => {
    const { message, conversationId, sender, receipt } = data.payload;
    const currentUserId = chatStore.currentUser?.id;


    chatStore.upsertEntity(data.payload);

    const isViewing = messageStore.activeChatId === conversationId;
    const isFromMe = data.payload.message.senderId === currentUserId;
    if (!isFromMe) {
      if (isViewing) {
        receiptManager.emitMarkRead({
          receipt,
          senderId: message.senderId,
          userId: currentUserId!,
        });
      } else {
        receiptManager.emitMarkDelivered({
          receipt,
          senderId: message.senderId,
          userId: currentUserId!,
        });

        const chat = messageStore.chats.get(conversationId);
        if (chat) chat.unreadCount += 1;
      }
    }
  },
});


// export const updateMessage = async () => {};
// export const deleteMessage = async () => {};

export const messageManager = createMessageManager();
