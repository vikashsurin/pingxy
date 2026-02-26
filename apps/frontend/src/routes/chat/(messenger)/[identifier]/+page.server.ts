import { fetchMessages } from "$lib/server/api/message.api.js";
import { ConversationService } from "$lib/server/services/conversation.service.js";
import { UserService } from "$lib/server/services/user.service.js";

export const load = async ({ params, fetch, locals }) => {
  const identifier = params.identifier;
  const isExistingConv = identifier.startsWith("c_");
  const idValue = Number(identifier.replace(/^[cu]_/, ""));

  let partnerData = null;
  let messageData = null;
  if (isExistingConv) {
    const partner = await ConversationService.getPartner({
      customFetch: fetch,
      conversationId: idValue,
    });
    partnerData = partner;

    messageData = await fetchMessages({
      customFetch: fetch,
      conversationId: idValue,
      currentUserId: locals.user.id,
      limit: 20,
    });
  } else {
    partnerData = await UserService.getUser({
      customFetch: fetch,
      id: idValue,
    });
  }

  return {
    identifier,
    idValue,
    partner: partnerData,
    messages: messageData,
  };
};
