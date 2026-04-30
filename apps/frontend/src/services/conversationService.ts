import { DOMAIN_EVENTS, ServerEventMap } from "@pingxy/shared";
import { attachmentReqSchema } from "@pingxy/shared/domain/attachment/index";
import z from "zod";
import { createClientReq } from ".";
import { conversationsApi } from "../lib/api/conversation";
import queryClient from "../lib/queryClient";
import { useConversationStore } from "../store/conversationStore";
import { useUserStore } from "../store/userStore";

function createConversationService() {
  const findConversation = async ({ userId }: { userId: number }) => {
    const data = await conversationsApi.findConversation({ userId });

    return data;
  };

  const fetchConversations = async ({
    type,
  }: {
    type?: "direct" | "group";
  } = {}) => {
    console.log("manager called", type);
    const data = await conversationsApi.fetchConversations({ type });

    console.log({ data });
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
    return data;
  };

  const fetchConversation = async ({
    conversationId,
  }: {
    conversationId: number;
  }) => {
    const data = await conversationsApi.fetchConversation({ conversationId });
    return data;
  };

  const createMessage = async ({
    content,
    conversationId,
    recipientId,
    recipientUsername,
    attachments = [],
  }: {
    content: string;
    conversationId?: number;
    recipientId?: number;
    recipientUsername?: string;
    attachments: z.infer<typeof attachmentReqSchema>[];
  }) => {
    const payload = createClientReq(DOMAIN_EVENTS.MESSAGES.CREATE, {
      message: {
        clientMessageId: crypto.randomUUID(),
        conversationId: conversationId ?? null,
        content: content,
      },
      attachments: attachments,
      recipient: {
        id: recipientId,
        username: recipientUsername,
      },
      conversationId: conversationId ?? undefined,
    });
    console.log({ payload });
    const data = await conversationsApi.sendMessage(payload);
    console.log({ messageCreated: data });
    return data;
  };

  const fetchMessages = async (
    conversationId: number,
    limit?: number,
    beforeId?: number,
  ) => {
    const data = await conversationsApi.fetchMessages({
      conversationId,
      limit,
      before: beforeId,
    });
    const messages = data.entities.messages;
    const attachments = data.entities.attachments;

    for (const attachment of attachments) {
      useConversationStore.getState().upsertAttachment(attachment);
    }

    console.log({ data, messages, attachments });
    return {
      rows: messages,
      nextCursor: messages.length === limit ? messages[0].id - 1 : undefined,
    };
  };

  const handleNewMessage = (
    payload: ServerEventMap["event:message.created"]["payload"],
  ) => {
    const { message, conversation, attachments, sender } = payload;

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

  const createGroup = async (formData: FormData) => {
    const visibility = formData.get("visibility") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const maxParticipants = formData.get("maxParticipants") as string;

    console.log({ visibility, name, description, maxParticipants });

    if (!visibility || !name || !description || !maxParticipants) return;

    const payload = createClientReq(DOMAIN_EVENTS.CONVERSATIONS.CREATE, {
      name,
      isPrivate: visibility === "private",
      description,
      maxParticipants: parseInt(maxParticipants),
    });
    const data = await conversationsApi.createGroup(payload);
    console.log({ groupCreated: data });
    return data;
  };

  // Create Invite
  const createInvite = async ({
    conversationId,
  }: {
    conversationId: number;
  }) => {
    const data = await conversationsApi.createInvite({ conversationId });
    console.log({ datafrominvite: data });
    return data;
  };

  // Fetch Invites
  const fetchInvites = async ({
    conversationId,
  }: {
    conversationId: number;
  }) => {
    const data = await conversationsApi.fetchInvites({ conversationId });

    return data;
  };

  const joinGroup = async ({ conversationId }: { conversationId: number }) => {
    const data = await conversationsApi.joinGroup({ conversationId });

    return data;
  };

  const fetchParticipants = async ({
    conversationId,
  }: {
    conversationId: number;
  }) => {
    const data = await conversationsApi.fetchParticipants({ conversationId });
    console.log({ dataFromFetchParticipants: data });
    return data;
  };

  // const fetchInvite = async ({ inviteId }: { inviteId: number }) => {
  //   const data = await conversationsApi.fetchInvite({ inviteId });
  //   return data;
  // };

  const deleteConversation = async ({
    conversationId,
  }: {
    conversationId: number;
  }) => {
    const data = await conversationsApi.deleteConversation({ conversationId });
    return data;
  };

  const leaveGroup = async () => {};
  return {
    findConversation,
    fetchConversations,
    fetchConversation,
    deleteConversation,
    createMessage,
    fetchMessages,
    handleNewMessage,
    createGroup,
    joinGroup,
    leaveGroup,
    createInvite,
    fetchInvites,
    fetchParticipants,
  };
}

export const conversationService = createConversationService();
