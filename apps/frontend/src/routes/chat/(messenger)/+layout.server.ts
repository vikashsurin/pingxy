import { createBlockApi } from "$lib/api/block";
import { createConversationApi } from "$lib/api/conversation.api";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, cookies, locals }) => {
  if (!locals.user) {
    throw redirect(302, "/");
  }

  const blockApi = createBlockApi(fetch);
  const conversationApi = createConversationApi(fetch);

  const [conversations, blockedUserIds] = await Promise.all([
    conversationApi.fetchConversations({
      userId: locals.user.id,
    }),

    blockApi.fetchBlockedUserIds({
      blockerId: locals.user.id,
    }),
  ]);

  return { conversations, blockedUserIds };
};
