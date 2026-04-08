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
        // If the cache doesn't exist or isn't an infinite query yet, do nothing
        if (!oldData || !oldData.pages) return oldData;

        // 1. Prevent duplicate messages if optimistic UI already added it
        const alreadyExists = oldData.pages.some((page: any) =>
          page.rows.some(
            (m: any) =>
              m.id === message.id ||
              m.clientMessageId === message.clientMessageId,
          ),
        );

        if (alreadyExists) return oldData;

        // 2. Clone the pages array
        const newPages = [...oldData.pages];

        // 3. Target the page with the newest messages (usually index 0 in your setup)
        const latestPage = newPages[0];

        // 4. Append the new message to the rows of that page
        newPages[0] = {
          ...latestPage,
          rows: [...latestPage.rows, message],
        };

        return {
          ...oldData,
          pages: newPages,
        };
      },
    );
  };

  return { fetchConversations, createMessage, handleNewMessage };
}

export const conversationManager = createConversationManager();
