import { createConversationApi } from "$lib/api/conversation.api.js";
import { createMessageApi } from "$lib/api/message.api.js";
import { createUserApi } from "$lib/api/user.api.js";

export const load = async ({ params, fetch, locals }) => {
  const { identifier } = params;
  const idValue = Number(identifier.replace(/^[cug]_/, ""));
  const identifierType = identifier.startsWith("u_") ? "user" : "conversation";
  return {
    identifierType,
    identifier,
    idValue,
  };

  // const messageApi = createMessageApi(fetch);
  // const conversationApi = createConversationApi(fetch);
  // const userApi = createUserApi(fetch);

  // 1. check if identifier starts with u_
  // if (identifier.startsWith("u_")) {
  //   // const existingConv = await conversationApi.findByUser({
  //   //   userId: idValue,
  //   // });
  //   // if (existingConv) {
  //   //   throw redirect(302, `/chat/c_${existingConv.conversationId}`);
  //   // }
  //   const partner = await userApi.fetchUserDetails({
  //     id: idValue,
  //   });

  //   return {
  //     identifier,
  //     identifierType: "user",
  //     idValue,
  //     partner,
  //   };
  // }

  // // 2. check if identifier starts with c_
  // if (identifier.startsWith("c_")) {
  //   const [partner, data] = await Promise.all([
  //     conversationApi.fetchPartner({
  //       conversationId: idValue,
  //     }),

  //     messageApi.fetchMessages({
  //       conversationId: idValue,
  //       limit: 20,
  //     }),
  //   ]);
  //   return {
  //     identifier,
  //     identifierType: "conversation",
  //     idValue,
  //     partner,
  //     entities: data.entities,
  //   };
  // }

  // // 3. check if identifier starts with g_
  // if (identifier.startsWith("g_")) {
  //   // do the following.
  // }
};
