import { eventBus } from "@lib/events";
import { createServerEvent } from "@lib/socket/socket.factory";
import { AttachmentService } from "@modules/attachments/attachment.service";
import { BlockService } from "@modules/block/block.service";
import { MessageRepository } from "@modules/messages/message.repository";
import { ParticipantService } from "@modules/participants";
import { ParticipantRepository } from "@modules/participants/participant.repository";
import { ReceiptService } from "@modules/receipts";
import { UserRepository } from "@modules/users/user.repository";
import { DOMAIN_EVENTS, SERVER_EVENTS } from "@pingxy/shared/constants";
import { ClientReqMap, User } from "@pingxy/shared/types";
import { HTTPException } from "hono/http-exception";
import { ConversationRepository } from "./conversation.repository";

export const ConversationService = {
  findByUsers: async ({
    currentUserId,
    userId,
  }: {
    currentUserId: number;
    userId: number;
  }) => {
    try {
      return await ConversationRepository.selectByUsersPrecise(
        currentUserId,
        userId,
      );
    } catch (error) {
      console.error("Error finding conversation by user ids:", error);
      throw new Error("Error finding conversation by user ids");
    }
  },


  convAggregation: async ({ userId }: { userId: number }) => {
    const conversations = await ConversationRepository.selectAll({ userId })
    const cIds = conversations.map((c) => c.id);

    const participants = await ParticipantRepository.selectManyByConvIds({ conversationIds: cIds });
    const ids = participants.map((p) => p.userId);

    const users = await UserRepository.selectManyByIds({ ids: ids });

    // may also send cids,uids,pids if needed
    return { conversations, participants, users };
  },



  findOrCreateByUsers: async ({
    currentUserId,
    userId,
  }: {
    currentUserId: number;
    userId: number;
  }) => {
    try {
      const result = await ConversationRepository.selectByUsersPrecise(
        currentUserId,
        userId,
      );

      if (result) {
        return result.conversation;
      }

      const [conversation] = await ConversationRepository.insert({
        type: "direct",
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
      });

      return conversation;
    } catch (error) {
      console.error("Error finding or creating conversation", error);
      throw new Error("Internal Server Error");
    }
  },

  getById: async (conversationId: number) => {
    try {
      return await ConversationRepository.selectById(conversationId);
    } catch (error) {
      console.error("Error getting conversation by id:", error);
      throw new Error("Error getting conversation by id");
    }
  },

  getPartnerForConversation: async ({
    userId,
    conversationId,
  }: {
    userId: number;
    conversationId: number;
  }) => {
    try {
      const isUserInConversation =
        await ConversationRepository.isUserInConversation({
          userId,
          conversationId,
        });
      if (!isUserInConversation) throw new Error("User is not in conversation");

      const partner =
        await ConversationRepository.selectPartnerByConversationId({
          userId,
          conversationId,
        });
      return partner;
    } catch (error) {
      console.error("Error finding conversation for user:", error);
      throw new Error("Error finding conversation for user");
    }
  },


  delete: async (conversationId: number) => {
    try {
      return await ConversationRepository.delete(conversationId);
    } catch (error) {
      console.error("Error removing conversation:", error);
      throw new Error("Error removing conversation");
    }
  },


  sendMessage: async (
    body: ClientReqMap[typeof DOMAIN_EVENTS.MESSAGES.CREATE],
    user: User
  ) => {
    const { message, recipient, attachments } = body.payload;
    // const result = await db.transaction(async (tx) => {
    //  TODO: Wrap it in transaction

    const hasBlock = await BlockService.hasBlock({
      blockerId: user.id,
      blockedId: recipient.id,
    });

    if (hasBlock) {
      throw new HTTPException(400, {
        message: "User is blocked",
      });
    }

    const conversation = await ConversationService.findOrCreateByUsers({
      currentUserId: user.id,
      userId: recipient.id,
    });

    const participants = await ParticipantService.create({
      conversationId: conversation.id,
      user1Id: user.id,
      user2Id: recipient.id,
    });

    const [insertedMessage] = await MessageRepository.insertMessage({
      conversationId: conversation.id!,
      clientMessageId: message.clientMessageId,
      senderId: user.id,
      content: message.content,
    });

    // update conversation activity
    const [updatedConversation] = await ConversationRepository.updateActivity({
      id: conversation.id,
      lastMessageId: insertedMessage.id,
    })



    const savedAttachments = await AttachmentService.createAttachment({
      attachments,
      userId: user.id,
      messageId: insertedMessage.id,
    });

    const attachmentsWithUrls = [];

    for (const a of savedAttachments) {
      const endpoint = process.env.MINIO_ENDPOINT
      const bucket = process.env.MINIO_BUCKET
      const url = `${endpoint}/${bucket}/${a.key}`
      const thumbUrl = a.thumbKey ? `${endpoint}/${bucket}/${a.thumbKey}` : undefined;

      attachmentsWithUrls.push({ ...a, url, thumbUrl });
    }
    const [messageReceipt] = await ReceiptService.createMessageReceipt({
      conversationId: conversation.id,
      messageId: insertedMessage.id,
      readerId: recipient.id,
      status: "sent",
    });


    await ParticipantService.incrementUnreadCount({
      conversationId: conversation.id,
      senderId: user.id,
    });

    const responseEnvelope = createServerEvent(SERVER_EVENTS.MESSAGES.CREATED, {
      message: insertedMessage,
      attachments: attachmentsWithUrls,
      receipt: messageReceipt,
      conversation: updatedConversation,
      sender: user,
      recipient: recipient,
    });

    eventBus.emit(SERVER_EVENTS.MESSAGES.CREATED, {
      ...responseEnvelope,
    });
    return responseEnvelope;
  },

};
