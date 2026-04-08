import { create } from "zustand";

type ChatState = {
  authUser: any | null;
  conversationId: number | null;
  displayName: string | null;
  setAuthUser: (user: any) => void;
  setConversationId: (id: number) => void;
  setDisplayName: (name: string) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  authUser: {},
  conversationId: null,
  displayName: "",
  setAuthUser: (user: any) => set({ authUser: user }),
  setConversationId: (id: number) => set({ conversationId: id }),
  setDisplayName: (name: string) => set({ displayName: name }),
}));
