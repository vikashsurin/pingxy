import { DOMAIN_EVENTS, ServerEventMap } from "@pingxy/shared";
import { attachmentReqSchema } from "@pingxy/shared/domain/attachment/index";
import z from "zod";
import { createClientReq } from ".";
import { conversationsApi } from "../lib/api/conversation";
import queryClient from "../lib/queryClient";
import { GroupCreateForm } from "../lib/schema/group";
import { send } from "../socket/socket";
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
    const data = await conversationsApi.fetchConversations({ type });

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
        userName: recipientUsername,
      },
      conversationId: conversationId ?? undefined,
    });
    const data = await conversationsApi.sendMessage(payload);
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


    console.log({ dataMessages: data })
    const messages = data.entities.messages;
    // const attachments = data.entities.attachments;

    // for (const attachment of attachments) {
    //   useConversationStore.getState().upsertAttachment(attachment);
    // }

    return {
      rows: messages,
      nextCursor: messages.length === limit ? messages[0].id - 1 : undefined,
    };
  };

  const handleIncomingMessage = (
    payload: ServerEventMap["event:message.created"]["payload"],
  ) => {
    const { message, conversation, attachments, sender } = payload;

    // if (attachments.length > 0) {
    //   for (const attachment of attachments) {
    //     useConversationStore.getState().upsertAttachment(attachment);
    //   }
    // }


    console.log({ from: message })

    queryClient.setQueryData(
      ["messages", message.conversationId],
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

  const createGroup = async (formData: GroupCreateForm) => {
    const { visibility, name, description, maxParticipants } = formData;

    if (!visibility || !name || !description || !maxParticipants) return;

    const payload = createClientReq(DOMAIN_EVENTS.CONVERSATIONS.CREATE, {
      name,
      isPrivate: visibility === "private",
      description,
      maxParticipants,
    });
    const data = await conversationsApi.createGroup(payload);
    return data;
  };

  // Create Invite
  const createInvite = async ({
    conversationId,
    expiresAt,
    maxUses,
  }: {
    conversationId: number;
    expiresAt: string;
    maxUses: number;
  }) => {


    const data = await conversationsApi.createInvite({ conversationId, expiresAt: expiresAt, maxUses });

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


  const subscribe = async ({
    conversationId,
  }: {
    conversationId: number;
  }) => {
    const message = createClientReq(DOMAIN_EVENTS.CONVERSATIONS.SUBSCRIBE, {
      conversationId,
    });

    send(message)
  }


  const handleSubscription = async ({
    conversationId,
  }: {
    conversationId: number;
  }) => {
    console.log("subscribed", conversationId)
  };

  const leaveGroup = async () => { };
  return {
    findConversation,
    fetchConversations,
    fetchConversation,
    deleteConversation,
    createMessage,
    fetchMessages,
    handleIncomingMessage,
    createGroup,
    joinGroup,
    leaveGroup,
    createInvite,
    fetchInvites,
    fetchParticipants,
    subscribe,
    handleSubscription,
  };
}

export const conversationService = createConversationService();
