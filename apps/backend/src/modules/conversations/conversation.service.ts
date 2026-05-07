import { broadcast } from "@lib/socket/pubsub";
import { createServerEvent } from "@lib/socket/socket.factory";
import { AttachmentService } from "@modules/attachments/attachment.service";
import { ConversationInviteRepository } from "@modules/conversation-invites/conversation-invite.repository";
import { MessageRepository } from "@modules/messages/message.repository";
import { ParticipantService } from "@modules/participants";
import { ParticipantRepository } from "@modules/participants/participant.repository";
import { UserRepository } from "@modules/users/user.repository";
import { DOMAIN_EVENTS, SERVER_EVENTS } from "@pingxy/shared/constants";
import { createGroupReqSchema, InviteInserSchema } from "@pingxy/shared/domain";
import { ClientReqMap, User } from "@pingxy/shared/types";
import { HTTPException } from "hono/http-exception";
import z from "zod";
import { ConversationRepository } from "./conversation.repository";
import { UserService } from "@modules/users";

export const ConversationService = {
  getConversations: async ({
    userId,
    type,
  }: {
    userId: number;
    type?: "direct" | "group";
  }) => {
    const conversations = await ConversationRepository.selectConversations({
      userId,
      type,
    });

    const cIds = conversations.map((c) => c.id);
    const participants = await ParticipantRepository.selectManyByConvIds({
      conversationIds: cIds,
    });

    const uIds = participants.map((p) => p.userId);
    const users = await UserRepository.selectManyByIds({ ids: uIds });
    return { conversations, participants, users };
  },

  getConversation: async ({ conversationId }: { conversationId: number }) => {
    const conversation =
      await ConversationRepository.selectById(conversationId);
    if (!conversation) return null;
    return conversation;
  },

  getGroupParticipants: async ({ groupId }: { groupId: number }) => {
    const participants =
      await ParticipantRepository.selectParticipantsByConversationId(groupId);
    return participants;
  },

  findByUsers: async ({
    currentUserId,
    userId,
  }: {
    currentUserId: number;
    userId: number;
  }) => {
    try {
      const conversation = await ConversationRepository.selectByUsersPrecise(
        currentUserId,
        userId,
      );
      if (!conversation) {
        return null;
      }
      return conversation;
    } catch (error) {
      console.error("Error finding conversation by user ids:", error);
      throw new Error("Error finding conversation by user ids");
    }
  },

  // joinGroup: async (groupId: number, userId: number) => {
  //   try {
  //     const participant = await ParticipantRepository.insertParticipant({
  //       conversationId: groupId,
  //       userId,
  //       role: "member",
  //     });

  //     if (!participant) {
  //       throw new Error("Error joining group");
  //     }

  //     return participant;
  //   } catch (error) {
  //     console.error("Error joining group:", error);
  //     throw new Error("Error joining group");
  //   }
  // },

  leaveGroup: async (groupId: number, userId: number) => {
    try {
    } catch (error) {
      console.error("Error leaving group:", error);
      throw new Error("Error leaving group");
    }
  },

  createInvite: async ({
    groupId,
    userId,
    expiresAt: expiresAtStr,
    maxUses,
  }: {
    groupId: number;
    userId: number;
    expiresAt: string;
    maxUses: number;
  }) => {
    try {
      // Check if the conversation/group exists
      const conversation = await ConversationRepository.selectById(groupId);

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const inviteCode = crypto.randomUUID();
      const defaultExpiresAt = new Date();
      defaultExpiresAt.setHours(defaultExpiresAt.getHours() + 24);

      const invite: z.infer<typeof InviteInserSchema> = {
        conversationId: groupId,
        requiresApproval: true,
        inviteCode,
        maxUses: maxUses,
        createdBy: userId,
        expiresAt: expiresAtStr.length > 0 ? new Date(expiresAtStr) : defaultExpiresAt,
        createdAt: new Date(),
      };

      const result = await ConversationInviteRepository.insert({ invite });

      return result;
    } catch (error) {
      console.error("Error creating invite:", error);
      throw new Error("Error creating invite");
    }
  },

  getInvites: async ({ groupId }: { groupId: number }) => {
    const result = await ConversationInviteRepository.selectAll({ groupId });
    if (result.length === 0) return null;
    return result;
  },

  newFindByUsers: async ({
    authUserId,
    userId,
  }: {
    authUserId: number;
    userId: number;
  }) => {
    try {
      const conversation =
        await ConversationRepository.selectExistingBetweenUids(
          authUserId,
          userId,
        );

      if (conversation.length === 0) {
        return null;
      }
      return conversation[0];
    } catch (error) {
      console.error("Error finding conversation by user ids:", error);
      throw new Error("Error finding conversation by user ids");
    }
  },

  createGroup: async ({
    payload,
    user }: {
      payload: z.infer<typeof createGroupReqSchema>["payload"],
      user: User
    }) => {

    const newConversation = {
      type: "group" as const,
      name: payload.name,
      isPrivate: payload.isPrivate,
      createdBy: user.id,
      description: payload.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      maxParticipants: payload.maxParticipants
    };
    const [conversation] = await ConversationRepository.insert(newConversation);

    const participant = await ParticipantRepository.insertParticipant({
      conversationId: conversation.id,
      userId: user.id,
      userName: user.userName,
      joinedAt: new Date(),
      role: "admin" as const,
    });
    return conversation;
  },

  convAggregation: async ({ userId }: { userId: number }) => {
    const conversations = await ConversationRepository.selectAll({ userId });
    const cIds = conversations.map((c) => c.id);

    const participants = await ParticipantRepository.selectManyByConvIds({
      conversationIds: cIds,
    });
    const ids = participants.map((p) => p.userId);

    const users = await UserRepository.selectManyByIds({ ids: ids });

    // may also send cids,uids,pids if needed
    return { conversations, participants, users };
  },

  findOrCreate: async ({
    currentUserId,
    userId,
  }: {
    currentUserId: number;
    userId?: number | null;
  }) => {
    try {
      // 1. Check if a conversation already exists between the two users
      if (!currentUserId || !userId) throw new Error("Missing fields");

      const result = await ConversationRepository.selectByUsersPrecise(
        currentUserId,
        userId,
      );

      if (result) {
        return result.conversation;
      }

      // 2. If no conversation exists, create a new one
      // user1Id should be the smaller of the two user ids
      // and user2Id should be the larger of the two user ids
      const user1Id = Math.min(currentUserId, userId);
      const user2Id = Math.max(currentUserId, userId);

      const [conversation] = await ConversationRepository.insert({
        type: "direct",
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
        user1Id,
        user2Id,
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
    user: User,
  ) => {
    const { message, recipient, conversationId, attachments } = body.payload;
    // check for blocks

    const conversation = conversationId
      ? await ConversationRepository.selectById(conversationId)
      : await ConversationService.findOrCreate({
        currentUserId: user.id,
        userId: recipient?.id,
      });

    console.log({ conversationId, conversation, message, user, recipient });

    if (conversation.type === "direct") {
      if (!recipient || recipient.id === null || !recipient.id) {
        return null;
      }

      // TODO: inclue recipient userName in message payload
      // or improve current implement i.e fetch user details via uid
      const user2 = await UserService.getUserById(recipient.id)

      await ParticipantService.create({
        conversationId: conversation.id,
        user1Id: user.id,
        user1Name: user.userName,
        user2Id: recipient.id,
        user2Name: user2.userName,
      });
    } else {
      const isParticipant = await ParticipantService.isParticipant({
        conversationId: conversation.id,
        userId: user.id,
      });

      if (!isParticipant)
        throw new HTTPException(403, { message: "Not a participant" });
    }

    // Insert the message
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
    });

    // Update lastReadMessageId and timestamp
    const [updatedParticipant] = await ParticipantRepository.update({
      userId: user.id,
      lastReadMessageId: insertedMessage.id,
      lastReadAt: new Date(),
      conversationId: conversation.id,
    });

    // const withAttachements = { ...insertedMessage, attachments: [] }

    const savedAttachments = await AttachmentService.createAttachment({
      attachments,
      userId: user.id,
      messageId: insertedMessage.id,
    });


    const attachmentsWithUrls = [];

    for (const a of savedAttachments) {
      // const endpoint = process.env.MINIO_ENDPOINT;
      const endpoint = 'http://localhost:9000';
      const bucket = process.env.MINIO_BUCKET;
      const url = `${endpoint}/${bucket}/${a.key}`;
      const thumbUrl = a.thumbKey
        ? `${endpoint}/${bucket}/${a.thumbKey}`
        : undefined;

      attachmentsWithUrls.push({ ...a, url, thumbUrl });
    }

    const withAttachements = { ...insertedMessage, attachments: attachmentsWithUrls };

    // withAttachements.attachments = attachmentsWithUrls;

    // Update unread count
    await ParticipantService.incrementUnreadCount({
      conversationId: conversation.id,
      senderId: user.id,
    });


    // add attachements ids
    // const includeAttachments = attachments.length > 0;
    // // const updatedMessage = includeAttachments
    // //   ? { ...insertedMessage, attachments:[]  }
    // //   : insertedMessage;
    // if()



    const participants =
      await ParticipantService.getParticipantsByConversationId(conversation.id);

    const responseEnvelope = createServerEvent(SERVER_EVENTS.MESSAGES.CREATED, {
      message: withAttachements,
      attachments: attachmentsWithUrls,
      conversation: updatedConversation,
      sender: updatedParticipant,
      participants: participants,
    });

    console.log('dd', responseEnvelope)

    broadcast(SERVER_EVENTS.MESSAGES.CREATED, responseEnvelope);
    return responseEnvelope;
  },


  subscribed: async (conversationId: number) => {
    const responseEnvelope = createServerEvent(SERVER_EVENTS.CONVERSATIONS.SUBSCRIBE, {
      conversationId,
    });

    broadcast(SERVER_EVENTS.CONVERSATIONS.SUBSCRIBE, responseEnvelope)

  },
};
