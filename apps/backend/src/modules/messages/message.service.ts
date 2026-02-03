import { ClientNewMessageType, ServerNewMessageType, UpdateMessageType } from "@pingxy/shared/types";
import { ConversationService } from "../conversations";
import { ParticipantService } from "../participants";
import { ReceiptService } from "../receipts";
import { MessageRepository } from "./message.repository";


import { DOMAIN_EVENTS, eventBus } from "@common/events";
import { HTTPException } from "hono/http-exception";
import db from "src/common/db/client";



export const MessageService = {
  sendMessage: async (body: ClientNewMessageType) => {
    try {

      const { message, recipient } = body.payload;
      // const result = await db.transaction(async (tx) => {
      //  TODO: Wrap it in transaction
      const conversation = await ConversationService.findOrCreateByUsers({
        currentUserId: message.sender_id,
        userId: recipient.id,
      });

      const participants = await ParticipantService.create({
        conversation_id: conversation.conversation_id,
        user1_id: message.sender_id,
        user2_id: recipient.id,
      });

      const [insertedMessage] = await MessageRepository.insertMessage({
        conversation_id: conversation.conversation_id,
        client_message_id: message.client_message_id,
        sender_id: message.sender_id,
        content: message.content,
      });

      const [messageReceipt] = await ReceiptService.createMessageReceipt({
        conversation_id: conversation.conversation_id,
        message_id: insertedMessage.message_id,
        user_id: recipient.id,
        status: "sent",
      });
      // })

      const responseEnvelope: ServerNewMessageType = {
        id: body.id,
        type: body.type,
        payload: {
          message: insertedMessage,
          receipt: messageReceipt,
          conversation_id: conversation.conversation_id,
          recipient: recipient,
        },
      };
      eventBus.emit(DOMAIN_EVENTS.MESSAGES.SENT, {
        ...responseEnvelope,
      });
      return;
    } catch (error) {
      console.error(error);
      throw new HTTPException(500, { message: "Failed to send message" });
    }
  },

  getById: async (message_id: number) => {
    try {
      return await MessageRepository.selectMessageById(message_id);
    } catch (error) {
      console.error("Error getting message by id:", error);
      throw new Error("Error getting message by id");
    }
  },

  getByConversationId: async ({
    conversation_id,
    user_id,
  }: {
    conversation_id: number;
    user_id: number;
  }) => {
    try {
      const [participant] = await ParticipantService.isParticipant({
        conversation_id,
        user_id,
      });
      if (!participant) throw new Error("Not a participant");

      return await MessageRepository.selectMessagesByConversationId(
        conversation_id,
      );
    } catch (error) {
      console.error("Error getting messages by conversation id:", error);
      throw new Error("Error getting messages by conversation id");
    }
  },

  getMessagesAndReceiptsByConversation: async ({
    conversation_id,
    user_id,
    before,
    after,
    limit,
  }: {
    conversation_id: number;
    user_id: number;
    before: number | null;
    after: number | null;
    limit: number;
  }) => {
    try {
      const [participant] = await ParticipantService.isParticipant({
        conversation_id,
        user_id,
      });
      if (!participant) throw new Error("Not a participant");

      const result =
        await MessageRepository.selectMessagesAndReceiptsByConversation({
          conversation_id,
          user_id,
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

  getBySenderId: async (sender_id: number) => {
    try {
      return await MessageRepository.selectMessagesBySenderId(sender_id);
    } catch (error) {
      console.error("Error getting messages by sender id:", error);
      throw new Error("Error getting messages by sender id");
    }
  },

  update: async (message_id: number, message: Partial<UpdateMessageType>) => {
    try {
      return await MessageRepository.updateMessage(message_id, message);
    } catch (error) {
      console.error("Error updating message:", error);
      throw new Error("Error updating message");
    }
  },

  remove: async (message_id: number) => {
    try {
      return await MessageRepository.deleteMessage(message_id);
    } catch (error) {
      console.error("Error deleting message:", error);
      throw new Error("Error deleting message");
    }
  },

  // getLimitMessagesByConvId : async ({
  //   conversation_id,
  //   user_id,
  //   before,
  //   after,
  //   limit }: {
  //     conversation_id: number,
  //     user_id: number,
  //     before: number | null,
  //     after: number | null,
  //     limit: number
  //   }) => {
  //   const result = await MessageRepository.selectLimitedMessagesByConversation({
  //     conversation_id,
  //     user_id,
  //     before,
  //     after,
  //     limit,
  //     tx: db
  //   });
  //   return result;
  // }
};
