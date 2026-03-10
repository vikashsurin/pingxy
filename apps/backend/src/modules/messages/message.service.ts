import type { ClientReqMap } from "@pingxy/shared/socket/types";
import { ConversationService } from "../conversations";
import { ParticipantService } from "../participants";
import { ReceiptService } from "../receipts";
import { MessageRepository } from "./message.repository";

import { eventBus } from "@common/events";
import { createServerEvent } from "@common/socket/socket.factory";
import { BlockService } from "@modules/block/block.service";
import { DOMAIN_EVENTS, SERVER_EVENTS } from "@pingxy/shared/constants/index";
import { HTTPException } from "hono/http-exception";
import db from "src/common/db/client";
import { AttachmentService } from "@modules/attachments/attachment.service";

export const MessageService = {
  sendMessage: async (
    body: ClientReqMap[typeof DOMAIN_EVENTS.MESSAGES.CREATE],
  ) => {
    const { message, recipient, sender, attachments } = body.payload;
    // const result = await db.transaction(async (tx) => {
    //  TODO: Wrap it in transaction

    const hasBlock = await BlockService.hasBlock({
      blockerId: message.senderId,
      blockedId: recipient.id,
    });

    if (hasBlock) {
      throw new HTTPException(400, {
        message: "User is blocked",
      });
    }

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
      conversationId: conversation.conversationId!,
      clientMessageId: message.clientMessageId,
      senderId: message.senderId,
      content: message.content,
    });

    const insertedAttachments = await AttachmentService.createAttachment({
      attachments,
      userId: message.senderId,
      messageId: insertedMessage.messageId,
      conversationId: conversation.conversationId,
    });

    const [messageReceipt] = await ReceiptService.createMessageReceipt({
      conversationId: conversation.conversationId,
      messageId: insertedMessage.messageId,
      readerId: recipient.id,
      status: "sent",
    });


    await ParticipantService.incrementUnreadCount({
      conversationId: conversation.conversationId,
      senderId: message.senderId,
    });

    const responseEnvelope = createServerEvent(SERVER_EVENTS.MESSAGES.CREATED, {
      message: insertedMessage,
      attachments: insertedAttachments,
      receipt: messageReceipt,
      conversationId: conversation.conversationId,
      sender: sender,
      recipient: recipient,
    });

    eventBus.emit(SERVER_EVENTS.MESSAGES.CREATED, {
      ...responseEnvelope,
    });
    return responseEnvelope;
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
      const receipts = new Map();
      const attachments = new Map();

      for (const row of rows) {
        const { message, receipt, attachment } = row;
        const msgId = message.messageId;

        if (!messages.has(msgId)) {
          messages.set(msgId, message);
        }

        if (receipt?.receiptId && !receipts.has(receipt.receiptId)) {
          receipts.set(receipt.receiptId, receipt);
        }

        if (attachment?.attachmentId && !attachments.has(attachment.attachmentId)) {
          attachments.set(attachment.attachmentId, attachment);
        }

      }


      return {
        entities: {
          messages: Array.from(messages.values()),
          receipts: Array.from(receipts.values()),
          attachments: Array.from(attachments.values()),
        }
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
