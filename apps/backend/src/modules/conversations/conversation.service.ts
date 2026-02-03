import { ConversationRepository } from "./conversation.repository";

export const ConversationService = {
  // create: async (conversation: NewConversation) => {
  //   try {
  //     return await ConversationRepository.insert(conversation);
  //   } catch (error) {
  //     console.error("Error creating conversation:", error);
  //     throw new Error("Ersror creating conversation");
  //   }
  // },

  find: async (participantIds: number[]) => {
    // try {
    //   return await ConversationRepository.selectConversationByParticipantIds(participantIds);
    // } catch (error) {
    //   console.error("Error finding conversation:", error);
    //   throw new Error("Error finding conversation");
    // }
  },

  findByUsers: async ({
    currentUserId,
    userId,
  }: {
    currentUserId: number;
    userId: number;
  }) => {
    try {
      return await ConversationRepository.selectByUsersPrecise(currentUserId, userId);
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
      const result = await ConversationRepository.selectByUsersPrecise(currentUserId, userId);

      if (result) {
        return result.conversation;
      }

      const [conversation] = await ConversationRepository.insert({
        conversation_type: "direct",
        created_at: new Date(Date.now()),
        updated_at: new Date(Date.now()),
      });

      return conversation;
    } catch (error) {
      console.error("Error finding or creating conversation", error);
      throw new Error("Internal Server Error");
    }
  },

  findByParticipant: async (
    participantIds: number[],
  ) => {
    // try {
    //   return await ConversationRepository.selectConversationByParticipantIds(participantIds);
    // } catch (error) {
    //   console.error("Error finding conversation by participant ids:", error);
    //   throw new Error("Error finding conversation by participant ids");
    // }
  },

  getById: async (conversation_id: number) => {
    try {
      return await ConversationRepository.selectById(conversation_id);
    } catch (error) {
      console.error("Error getting conversation by id:", error);
      throw new Error("Error getting conversation by id");
    }
  },

  getByUser: async ({
    user_id,
  }: {
    user_id: number;
  }) => {
    try {
      return await ConversationRepository.selectByUserId(user_id);
    } catch (error) {
      console.error("Error getting conversations by user id:", error);
      throw new Error("Error getting conversations by user id");
    }
  },

  delete: async (conversation_id: number) => {
    try {
      return await ConversationRepository.delete(conversation_id);
    } catch (error) {
      console.error("Error removing conversation:", error);
      throw new Error("Error removing conversation");
    }
  },
}
