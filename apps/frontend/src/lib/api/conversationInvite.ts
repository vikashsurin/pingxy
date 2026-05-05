function createConversationInviteApi() {
  const baseUrl = "http://localhost/api/conversation-invites";

  const fetchById = async ({ inviteId }: { inviteId: number }) => {
    const url = `${baseUrl}/${inviteId}`;
    const res = await fetch(`${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return await res.json();
  };

  const joinViaInvite = async ({ inviteCode }: { inviteCode: string }) => {
    const url = `${baseUrl}/${inviteCode}/join`;
    const res = await fetch(`${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Join conversation failed");
    }
    return await res.json();
  };

  const deleteInvites = async ({ ids }: { ids: number[] }) => {
    const url = `${baseUrl}`;
    const res = await fetch(`${url}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ ids }),
    });
    return await res.json();
  };

  const revokeInvite = async ({ id }: { id: number }) => {
    const url = `${baseUrl}/${id}/revoke`;
    const res = await fetch(`${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return await res.json();
  };

  const updateInvite = async ({ id, fields }: { id: number; fields: any }) => {
    const url = `${baseUrl}/${id}`;
    const res = await fetch(`${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return await res.json();
  };

  return {
    fetchById,
    joinViaInvite,
    deleteInvites,
    revokeInvite,
    updateInvite,
  };
}

export const conversationInviteApi = createConversationInviteApi();
