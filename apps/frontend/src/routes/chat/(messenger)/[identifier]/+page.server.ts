import { fetchMessages } from "$lib/server/api/message.api.js";
import { ConversationService } from "$lib/server/services/conversation.service.js";
import { UserService } from "$lib/server/services/user.service.js";
import { redirect } from "@sveltejs/kit";

export const load = async ({ params, fetch, locals }) => {
  const { identifier } = params;
  const idValue = Number(identifier.replace(/^[cug]_/, ""));

  // 1. check if identifier starts with u_
  if (identifier.startsWith("u_")) {
    const existingConv = await ConversationService.findConversation({
      customFetch: fetch,
      userId: idValue,
    });
    if (existingConv) {
      throw redirect(302, `/chat/c_${existingConv.conversationId}`);
    }
    const partner = await UserService.getUser({
      customFetch: fetch,
      id: idValue,
    });

    return {
      identifier,
      identifierType: "user",
      idValue,
      partner,
    };
  }

  // 2. check if identifier starts with c_
  if (identifier.startsWith("c_")) {
    const [partner, messages] = await Promise.all([
      ConversationService.getPartner({
        customFetch: fetch,
        conversationId: idValue,
      }),

      fetchMessages({
        customFetch: fetch,
        conversationId: idValue,
        currentUserId: locals.user.id,
        limit: 20,
      }),
    ]);
    return {
      identifier,
      identifierType: "conversation",
      idValue,
      partner,
      messages,
    };
  }

  // 3. check if identifier starts with g_
  if (identifier.startsWith("g_")) {
    // do the following.
  }
};
