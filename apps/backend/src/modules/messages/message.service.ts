import { ParticipantService } from "../participants";
import { MessageRepository } from "./message.repository";

import db from "@lib/db/client";

export const MessageService = {
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

  getMessages: async ({
    conversationId,
    userId,
    before = null,
    after = null,
    limit,
  }: {
    conversationId: number;
    userId: number;
    before?: number | null;
    after?: number | null;
    limit: number;
  }) => {
    try {
      // 1. Check whether user is a participant of the coversation
      const [participant] = await ParticipantService.isParticipant({
        conversationId,
        userId,
      });
      if (!participant) throw new Error("Not a participant");

      const rows = await MessageRepository.selectMessages({
        conversationId,
        userId,
        before,
        after,
        limit,
        tx: db,
      });

      const messages = new Map();
      const attachments = new Map();

      for (const row of rows) {
        const { message, attachment } = row;
        const msgId = message.id;

        if (!messages.has(msgId)) {
          messages.set(msgId, { ...message, attachments: [] });
        }

        if (attachment?.id) {
          const msg = messages.get(msgId);
          msg.attachments.push(attachment.id);
          messages.set(msgId, msg);

          if (!attachments.has(attachment.id)) {
            const endpoint = process.env.MINIO_ENDPOINT_PUBLIC;
            const bucket = process.env.MINIO_BUCKET;
            const url = `${endpoint}/${bucket}/${attachment.key}`;
            const thumbUrl = `${endpoint}/${bucket}/${attachment.thumbKey}`;
            attachments.set(attachment.id, { ...attachment, url, thumbUrl });
          }
        }
      }

      return {
        entities: {
          messages: Array.from(messages.values()),
          attachments: Array.from(attachments.values()),
        },
      };
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

  update: async (messageId: number, message: any) => {
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

  findLatest: async (conversationId: number) => {
    try {
      const [result] =
        await MessageRepository.selectLatestMessageByConversationId(
          conversationId,
        );
      return result.message;
    } catch (error) {
      console.error("Error finding first message:", error);
      throw new Error("Error finding first message");
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
