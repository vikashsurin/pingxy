import db, { DB_TX } from "@common/db/client";
import { ParticipantRepository } from "@modules/participants/participant.repository";

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

  getConversationDetails: async ({ userId }: { userId: number }) => {
    const rows = await ConversationRepository.getView(userId);


    // 1. partnerId → conversationId  (for clicking an online user)
    // const conversationByPartnerId = new Map<number, number>();

    // // 2. conversationId → partnerRow  (for clicking a conversation)
    // const partnerByConversationId = new Map<number, any>();


    // for (const row of rows) {
    //   const { conversationId, participantUserId } = row;

    //   if (participantUserId === 24) continue; // skip self rows

    //   conversationByPartnerId.set(participantUserId, conversationId);
    //   partnerByConversationId.set(conversationId, row);
    // }


    // console.log('sdf: ', { conversationByPartnerId, partnerByConversationId })
    return rows;
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

  getAlByUser: async ({ userId, tx = db }: { userId: number; tx?: DB_TX }) => {
    try {
      const memberships = await ParticipantRepository.selectByUserId({
        userId,
        tx,
      });
      if (!memberships.length) return [];
      const conversationIds = memberships.map((m) => m.conversationId);

      const participants =
        await ParticipantRepository.selectManyParticipantsByManyConversationIds(
          { conversationIds },
        );

      const conversations = await ConversationRepository.selectManyById({
        ids: conversationIds,
      });

      return memberships.map((m) => {
        const convMeta = conversations.find(
          (c) => c.id === m.conversationId,
        );

        const participantsInThisChat = participants.filter(
          (p) => p.conversationId === m.conversationId,
        );

        const partner = participantsInThisChat.find((p) => p.userId !== userId);

        return {
          conversationId: m.conversationId,
          unreadCount: m.unreadCount,
          type: convMeta?.type || "direct",
          displayName:
            convMeta?.type === "group"
              ? convMeta.name
              : partner?.username,
          lastMessageId: convMeta?.lastMessageId,
          updatedAt: convMeta?.updatedAt,
          partner:
            convMeta?.type === "direct"
              ? {
                id: partner?.userId,
                username: partner?.username,
                gender: partner?.gender,
                age: partner?.age,
                country: partner?.country,
                bio: partner?.bio,
              }
              : null,
          participants: participantsInThisChat,
        };
      });
    } catch (error) {
      console.error("Error getting conversations by user id:", error);
      throw new Error("Error getting conversations by user id");
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


  fetchMessages: async () => {

  }
};
