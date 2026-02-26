import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { fetchConversations } from "$lib/server/api/conversation.api";
import { fetchBlockedUserIdsRequest } from "$lib/server/api/block";
import { ConversationService } from "$lib/server/services/conversation.service";
import { BlockService } from "$lib/server/services/block.service";

export const load: LayoutServerLoad = async ({ fetch, cookies, locals }) => {
  if (!locals.user) {
    throw redirect(302, "/");
  }

  const [conversations, blockedUserIds] = await Promise.all([
    ConversationService.getForUser({
      customFetch: fetch,
      userId: locals.user.id,
    }),

    BlockService.getBlockedUserIds({
      customFetch: fetch,
      blockerId: locals.user.id,
    }),
  ]);

  return { conversations, blockedUserIds };
};
