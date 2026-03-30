import { conversationApi } from "$lib/api/conversation.api";
import { DOMAIN_EVENTS } from "@pingxy/shared/constants/index";
import { createClientReq } from "../factory";

const createConversationManager = () => {
  const createGroupConversation = async (conversation: {
    name: string;
    description: string;
    isPrivate: boolean;
    maxParticipants: number;
  }) => {
    const payload = createClientReq(DOMAIN_EVENTS.CONVERSATIONS.CREATE, {
      name: conversation.name,
      isPrivate: conversation.isPrivate,
      description: conversation.description,
      maxParticipants: conversation.maxParticipants,
    });

    return conversationApi.createGroupConversation(payload);
  };

  return {
    createGroupConversation,
  };
};

export const conversationManager = createConversationManager();
