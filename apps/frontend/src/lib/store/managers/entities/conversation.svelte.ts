import { DOMAIN_EVENTS } from "@pingxy/shared/constants/index";
import type { ClientReqMap } from "@pingxy/shared/socket/types";
import { validateSocket } from "../../helpers";
import type { PrivateConversation } from "../../store.svelte";

export const subscribeToConversation = async ({
  conversation,
  userId,
}: {
  conversation: PrivateConversation;
  userId: number | undefined;
}) => {
  if (!conversation.conversationId || !userId) return;

  const socket = validateSocket();
  if (!socket) return;

  const message: ClientReqMap[typeof DOMAIN_EVENTS.CONVERSATIONS.OPEN] = {
    id: crypto.randomUUID(),
    type: DOMAIN_EVENTS.CONVERSATIONS.OPEN,
    payload: {
      conversationId: conversation.conversationId,
      userId: userId,
    },
  };

  socket.send(JSON.stringify(message));
};
