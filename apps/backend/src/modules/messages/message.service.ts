import { NewMessage } from "@chat/shared/types";
import { MessageRepository } from "./message.repository";
import { ConversationService } from "../conversations";
import { ParticipantService } from "../participants";
import { ReceiptService } from "../receipts";
import db from "src/common/db/client";

export const MessageService = {
  create: async ({
    recipient_id,
    message,
  }: {
    recipient_id: number;
    message: NewMessage;
  }) => {
    try {
      // Check if conversation exists
      // If not create
      const conversation = await ConversationService.findOrCreateByUsers({
        userId1: message.sender_id,
        userId2: recipient_id,
      });

      if (!conversation) throw new Error("Conversation does not exits");

      // Create Participant
      const participant = await ParticipantService.create({
        conversation_id: conversation.conversation_id,
        user1_id: message.sender_id,
        user2_id: recipient_id,
      });

      if (!participant) throw new Error("Error creating participants");

      // Create Message
      const [insertedMessage] = await MessageRepository.insertMessage({
        conversation_id: conversation.conversation_id,
        client_message_id: message.client_message_id,
        sender_id: message.sender_id,
        content: message.content,
      });

      // Create message receipts
      const [messageReceipt] = await ReceiptService.createMessageReceipt({
        conversation_id: conversation.conversation_id,
        message_id: insertedMessage.message_id!,
        user_id: recipient_id,
        status: "sent",
      });

      return {
        msgData: {
          message: insertedMessage,
          receipt: messageReceipt,
        },
        conversation_id: conversation.conversation_id,
        sender: participant.sender,
        recipient: participant.recipient,
      };
    } catch (error) {
      console.error("Error creating message:", error);
      throw new Error("Error creating message");
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
      const [participant] = await ParticipantService.isParticipant({ conversation_id, user_id });
      if (!participant) throw new Error("Not a participant");

      return await MessageRepository.selectMessagesByConversationId(conversation_id);
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
      const [participant] = await ParticipantService.isParticipant({ conversation_id, user_id });
      if (!participant) throw new Error("Not a participant");

      const result = await MessageRepository.selectMessagesAndReceiptsByConversation({
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

  update: async (message_id: number, message: Partial<NewMessage>) => {
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
