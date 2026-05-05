import { ParticipantRepository } from "@modules/participants/participant.repository";
import { ParticipantInsertType } from "@pingxy/shared/types";
import { ConversationInviteRepository } from "./conversation-invite.repository";

export const ConversationInviteService = {
  createInvite: async () => { },
  acceptInvite: async () => { },
  rejectInvite: async () => { },

  invalidate: async (id: number) => {
    const invite = await ConversationInviteRepository.update({
      id,
      fields: { revokedAt: new Date() },
    });

    if (invite) {
      return invite;
    }

    return null;
  },
  getInviteById: async (id: number) => {
    const invite = await ConversationInviteRepository.selectById(id);
    return invite;
  },

  joinViaInvite: async ({ invitecode, userId }: { invitecode: string; userId: number }) => {
    const invite = await ConversationInviteRepository.selectByCode(invitecode);

    if (!invite) {
      throw new Error('Invite not found');
    }
    const conversationId = invite.conversationId
    const participantData: ParticipantInsertType = {
      conversationId,
      userId,
      role: 'member' as const,
      joinedAt: new Date(),
    }

    const participant = await ParticipantRepository.insertParticipant(participantData)

    // Increment usesCount
    if (participant) {
      await ConversationInviteRepository.incrementInviteUseCount({ code: invitecode })
    }

    return participant
  },

  deleteInvitesByIds: async (ids: number[]) => {
    return await ConversationInviteRepository.deleteInvitesByIds(ids)
  },

};
