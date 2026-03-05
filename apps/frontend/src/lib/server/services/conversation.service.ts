import {
  fetchConversations,
  fetchPartner,
  findByUser,
} from "$lib/server/api/conversation.api";
import type { UIConversation } from "$lib/types/chat";

export const ConversationService = {
  findConversation: async ({
    customFetch,
    userId,
  }: {
    customFetch: typeof fetch;
    userId: number;
  }) => {
    const data = await findByUser({ customFetch, userId });
    if (data) {
      return data.conversation;
    }
    return null;
  },

  getForUser: async ({
    customFetch,
    userId,
  }: {
    customFetch: typeof fetch;
    userId: number;
  }): Promise<UIConversation[]> => {
    const data: UIConversation[] = await fetchConversations({
      customFetch,
      userId,
    });

    return data;
  },

  getPartner: async ({
    customFetch,
    conversationId,
  }: {
    customFetch: typeof fetch;
    conversationId: number;
  }) => {
    const partner = await fetchPartner({
      customFetch,
      conversationId,
    });
    return partner;
  },
};
