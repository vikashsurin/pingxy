import { create } from "zustand";

type ParticipantMeta = {
  uid: number;
  pid: number;
};
type ConversationState = {
  conversations: Record<number, any>;
  participants: Record<number, any>;
  conversationIdx: Set<number>;
  convUserIdx: Map<number, number[]>;
  cc: Map<number, ParticipantMeta[]>;
  cps: Map<number, ParticipantMeta[]>;
  meta: Record<string, any>;
  upsertConversation: (conversation: any) => void;
  upsertParticipant: (participant: any) => void;
};
export const useConversationStore = create<ConversationState>((set) => ({
  conversations: {},
  participants: {},
  convUserIdx: new Map(),
  cc: new Map(),
  cps: new Map(),
  conversationIdx: new Set<number>(),
  meta: {},

  upsertConversation: (conversation: any) => {
    set((state) => ({
      conversations: {
        ...state.conversations,
        [conversation.id]: conversation,
      },
      meta: {
        ...state.meta,
        [conversation.id]: {
          name: conversation.name,
        },
      },

      conversationIdx: new Set([...state.conversationIdx, conversation.id]),
    }));
  },
  upsertParticipant: (participant: any) => {
    set((state) => {
      const existingUserIds =
        state.convUserIdx.get(participant.conversationId) || [];
      const existingCc = state.cc.get(participant.conversationId) || [];

      return {
        participants: {
          ...state.participants,
          [participant.id]: participant,
        },

        convUserIdx: new Map(state.convUserIdx).set(
          participant.conversationId,
          existingUserIds.includes(participant.userId)
            ? existingUserIds
            : [...existingUserIds, participant.userId],
        ),
        cps: new Map(state.cps).set(participant.conversationId, [
          ...(state.cps.get(participant.conversationId) || []),
          {
            uid: participant.userId,
            pid: participant.id,
          },
        ]),
      };
    });
  },
}));
