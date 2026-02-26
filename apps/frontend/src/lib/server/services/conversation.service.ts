import {
  fetchConversations,
  fetchPartner,
} from "$lib/server/api/conversation.api";
import type { UIConversation } from "$lib/types/chat";

export const ConversationService = {
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
