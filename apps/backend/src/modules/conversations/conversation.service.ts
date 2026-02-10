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
        conversationType: "direct",
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

  getByUser: async ({ userId }: { userId: number }) => {
    try {
      const result = await ConversationRepository.selectByUserId(userId);
      console.log({ result })
      return result;
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
};
