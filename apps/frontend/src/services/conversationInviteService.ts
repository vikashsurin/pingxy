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

  const revokeInvite = async ({ id }: { id: number }) => {
    const data = await conversationInviteApi.revokeInvite({ id });
    return data;
  };

  const updateInvite = async ({ id, }: { id: number }) => {
    // const data = await conversationInviteApi.updateInvite({ inviteId });
    return null;
  };

  return {
    fetchInvite,
    joinViaInvite,
    deleteInvites,
    updateInvite,
    revokeInvite,
  };
}

export const conversationInviteService = createConversationInviteService();
