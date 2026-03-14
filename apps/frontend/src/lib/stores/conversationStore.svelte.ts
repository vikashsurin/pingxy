import { SvelteMap } from "svelte/reactivity";
import { chatStore } from "./store.svelte";

class ChatState {
  conversationId = $state<number>(0);
  root: ConversationStore;

  // conversation states
  isTyping = $state(false);
  unreadCount = $state(0);
  private typingTimeout: any;

  constructor(conversationId: number, root: ConversationStore) {
    this.conversationId = conversationId;
    this.root = root;
  }

  handleTyping() {
    this.isTyping = true;
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => (this.isTyping = false), 3000);
  }
}

class ConversationStore {
  conversationByPartnerId = new SvelteMap<number, number>();
  partnerByConversationId = new SvelteMap<number, any>();

  chatState = new SvelteMap<number, ChatState>();

  
  
  buildConversationMap(items: any[]) {
    const currentUserId = chatStore.currentUser?.id;

    for (const row of items) {
      const { conversationId, participantUserId } = row;

      if (participantUserId === currentUserId) continue;

      this.conversationByPartnerId.set(participantUserId, conversationId);
      this.partnerByConversationId.set(conversationId, row);

      // state
      let state = this.chatState.get(conversationId);
      if (!state) {
        state = new ChatState(conversationId, this);
        this.chatState.set(conversationId, state);
      }

      state.unreadCount = row.unreadCount;
    }
  }
}
export const conversationStore = new ConversationStore();
