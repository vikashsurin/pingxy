import { DOMAIN_EVENTS } from "@pingxy/shared/constants/index";
import type { ClientReqMap } from "@pingxy/shared/socket/types";
import { validateSocket } from "$lib/utils/validateSocket";
import { send } from "$lib/socket/socket.svelte";
// export const subscribeToConversation = async ({
//   conversationId,
//   userId,
// }: {
//   conversationId: number;
//   userId: number;
// }) => {
//   if (!conversationId || !userId) return;

//   const socket = validateSocket();
//   if (!socket) return;

//   const message: ClientReqMap[typeof DOMAIN_EVENTS.CONVERSATIONS.OPEN] = {
//     id: crypto.randomUUID(),
//     type: DOMAIN_EVENTS.CONVERSATIONS.OPEN,
//     payload: {
//       conversationId: conversationId,
//       userId: userId,
//     },
//   };

//   socket.send(JSON.stringify(message));
// };

const createConversationManager = () => ({
  subscribeToConversation: async ({
    conversationId,
    userId,
  }: {
    conversationId: number;
    userId: number;
  }) => {
    if (!conversationId || !userId) return;

    const message: ClientReqMap[typeof DOMAIN_EVENTS.CONVERSATIONS.OPEN] = {
      id: crypto.randomUUID(),
      type: DOMAIN_EVENTS.CONVERSATIONS.OPEN,
      payload: {
        conversationId: conversationId,
        userId: userId,
      },
    };

    send(message);
  },
});

export const conversationManager = createConversationManager();
