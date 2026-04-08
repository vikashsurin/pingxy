import { DOMAIN_EVENTS, ServerEventMap } from "@pingxy/shared";
import { createClientReq } from ".";
import { conversationsApi } from "../api/conversation";
import queryClient from "../queryClient";
import { useConversationStore } from "../store/conversationStore";
import { useUserStore } from "../store/userStore";

function createConversationManager() {
  const fetchConversations = async () => {
    const data = await conversationsApi.fetchConversations();
    const { conversations, participants, users } = data;
    for (const conversation of conversations) {
      useConversationStore.getState().upsertConversation(conversation);
    }

    for (const participant of participants) {
      useConversationStore.getState().upsertParticipant(participant);
    }

    for (const user of users) {
      useUserStore.getState().upsertUser(user);
    }
  };

  const createMessage = async ({
    content,
    conversationId,
    recipientId,
    recipientUsername,
  }: {
    content: string;
    conversationId: number;
    recipientId: number;
    recipientUsername: string;
  }) => {
    const payload = createClientReq(DOMAIN_EVENTS.MESSAGES.CREATE, {
      message: {
        clientMessageId: crypto.randomUUID(),
        conversationId: conversationId,
        content: content,
      },
      attachments: [],
      recipient: {
        id: recipientId,
        username: recipientUsername,
      },
      conversationId: conversationId,
    });

    const data = await conversationsApi.sendMessage(payload);
    return data;
  };

  const handleNewMessage = (
    payload: ServerEventMap["event:message.created"]["payload"],
  ) => {
    const { message, conversation, attachments, sender, recipient } = payload;

    queryClient.setQueryData(
      ["messages", String(message.conversationId)],
      (oldData: any) => {
        if (!oldData) return oldData;

        // Immutably add the message
        return {
          ...oldData,
          entities: {
            ...oldData.entities,
            messages: [...oldData.entities.messages, message],
          },
        };
      },
    );
  };

  return { fetchConversations, createMessage, handleNewMessage };
}

export const conversationManager = createConversationManager();
