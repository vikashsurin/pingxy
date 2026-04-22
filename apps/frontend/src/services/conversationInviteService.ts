import { conversationInviteApi } from "../lib/api/conversationInvite";

function createConversationInviteService() {
  const fetchInvite = async ({ inviteId }: { inviteId: number }) => {
    const data = await conversationInviteApi.fetchById({ inviteId });

    return data;
  };

  const joinViaInvite = async ({ inviteCode }: { inviteCode: string }) => {
    const data = await conversationInviteApi.joinViaInvite({ inviteCode });
    console.log("joininvite data", data);
    return data;
  };

  const deleteInvites = async ({ ids }: { ids: number[] }) => {
    const data = await conversationInviteApi.deleteInvites({ ids });
    return data;
  };

  return {
    fetchInvite,
    joinViaInvite,
    deleteInvites,
  };
}

export const conversationInviteService = createConversationInviteService();
