import {
  ClientMessageType,
  ServerMessageType,
  UpdateMessageType,
} from "@pingxy/shared/types";
import { ConversationService } from "../conversations";
import { ParticipantService } from "../participants";
import { ReceiptService } from "../receipts";
import { MessageRepository } from "./message.repository";

import { DOMAIN_EVENTS, eventBus } from "@common/events";
import { HTTPException } from "hono/http-exception";
import db from "src/common/db/client";

export const MessageService = {
  sendMessage: async (body: ClientMessageType) => {
    try {
      const { message, recipient } = body.payload;
      // const result = await db.transaction(async (tx) => {
      //  TODO: Wrap it in transaction
      const conversation = await ConversationService.findOrCreateByUsers({
        currentUserId: message.senderId,
        userId: recipient.id,
      });

      const participants = await ParticipantService.create({
        conversationId: conversation.conversationId,
        user1Id: message.senderId,
        user2Id: recipient.id,
      });

      const [insertedMessage] = await MessageRepository.insertMessage({
        conversationId: conversation.conversationId,
        clientMessageId: message.clientMessageId,
        senderId: message.senderId,
        content: message.content,
      });

      const [messageReceipt] = await ReceiptService.createMessageReceipt({
        conversationId: conversation.conversationId,
        messageId: insertedMessage.messageId,
        userId: recipient.id,
        status: "sent",
      });
      // })

      const responseEnvelope: ServerMessageType = {
        id: body.id,
        type: body.type,
        payload: {
          message: insertedMessage,
          receipt: messageReceipt,
          conversationId: conversation.conversationId,
          recipient: recipient,
        },
      };
      eventBus.emit(DOMAIN_EVENTS.MESSAGES.SENT, {
        ...responseEnvelope,
      });
      return responseEnvelope;
    } catch (error) {
      console.error(error);
      throw new HTTPException(500, { message: "Failed to send message" });
    }
  },

  getById: async (messageId: number) => {
    try {
      return await MessageRepository.selectMessageById(messageId);
    } catch (error) {
      console.error("Error getting message by id:", error);
      throw new Error("Error getting message by id");
    }
  },

  getByConversationId: async ({
    conversationId,
    userId,
  }: {
    conversationId: number;
    userId: number;
  }) => {
    try {
      const [participant] = await ParticipantService.isParticipant({
        conversationId,
        userId,
      });
      if (!participant) throw new Error("Not a participant");

      return await MessageRepository.selectMessagesByConversationId(
        conversationId,
      );
    } catch (error) {
      console.error("Error getting messages by conversation id:", error);
      throw new Error("Error getting messages by conversation id");
    }
  },

  getMessagesAndReceiptsByConversation: async ({
    conversationId,
    userId,
    before,
    after,
    limit,
  }: {
    conversationId: number;
    userId: number;
    before: number | null;
    after: number | null;
    limit: number;
  }) => {
    try {
      const [participant] = await ParticipantService.isParticipant({
        conversationId,
        userId,
      });
      if (!participant) throw new Error("Not a participant");

      const result =
        await MessageRepository.selectMessagesAndReceiptsByConversation({
          conversationId,
          userId,
          before,
          after,
          limit,
          tx: db,
        });
      // const messages = result.messages;
      // const receipts = result.receipts;
      // return { messages, receipts };
      return result;
    } catch (error) {
      console.error(
        "Error getting messages and receipts by conversation id:",
        error,
      );
      throw new Error("Error getting messages and receipts by conversation id");
    }
  },

  getBySenderId: async (senderId: number) => {
    try {
      return await MessageRepository.selectMessagesBySenderId(senderId);
    } catch (error) {
      console.error("Error getting messages by sender id:", error);
      throw new Error("Error getting messages by sender id");
    }
  },

  update: async (messageId: number, message: Partial<UpdateMessageType>) => {
    try {
      return await MessageRepository.updateMessage(messageId, message);
    } catch (error) {
      console.error("Error updating message:", error);
      throw new Error("Error updating message");
    }
  },

  remove: async (messageId: number) => {
    try {
      return await MessageRepository.deleteMessage(messageId);
    } catch (error) {
      console.error("Error deleting message:", error);
      throw new Error("Error deleting message");
    }
  },

  // getLimitMessagesByConvId : async ({
  //   conversationId,
  //   userId,
  //   before,
  //   after,
  //   limit }: {
  //     conversationId: number,
  //     userId: number,
  //     before: number | null,
  //     after: number | null,
  //     limit: number
  //   }) => {
  //   const result = await MessageRepository.selectLimitedMessagesByConversation({
  //     conversationId,
  //     userId,
  //     before,
  //     after,
  //     limit,
  //     tx: db
  //   });
  //   return result;
  // }
};
