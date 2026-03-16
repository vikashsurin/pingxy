import { SvelteMap, SvelteSet } from "svelte/reactivity";
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
  chatState = new SvelteMap<number, ChatState>();

  // conversation id array to maintain order of conversations.
  convIds = $state<any[]>([]);

  participants = $state<any[]>([]);

  // conversationId -> conversation
  cm = new SvelteMap<number, any>();

  // conversationId -> Set<participantId>
  cp = new SvelteMap<number, SvelteSet<number>>();

  // participantId -> userId
  pu = new SvelteMap<number, number>();

  // userid -> conversationId
  uc = new SvelteMap<number, number>();

  getPartnerId(cid: number) {
    const user = chatStore.user;
    console.log({ user });
    const ids = this.cp.get(cid);
    if (!ids) return;
    for (const id of ids) {
      const uid = this.pu.get(id);
      if (user?.id !== uid) return uid;
    }
  }

  recentChats = $derived.by(() => {
    return this.convIds
      .map((id) => {
        return {
          ...this.cm.get(id),
          participants: this.cp.get(id) ?? new SvelteSet<number>(),
          partnerId: this.getPartnerId(id),
        };
      })
      .sort((a, b) => b.lastMessageId - a.lastMessageId);
  });

  upsertConversation(c: any) {
    const id = c.id;
    const wasMissing = !this.cm.has(id);

    this.cm.set(id, c);

    if (wasMissing) {
      this.convIds.push(id);
    }
  }

  seedFromConversations(items: any[]) {
    for (const item of items) {
      this.upsertConversation(item);
    }
  }

  seedFromParticipants(items: any[]) {
    for (const item of items) {
      // # cp
      let set = this.cp.get(item.conversationId);
      if (!set) {
        set = new SvelteSet<number>();
        this.cp.set(item.conversationId, set);
      }
      set.add(item.id);

      // # pu
      this.pu.set(item.id, item.userId);

      // # uc
      this.uc.set(item.userId, item.conversationId);

      // userStore #cache upsert into user cache.
      // userStore.upsert(item.user);
    }
  }
}
export const conversationStore = new ConversationStore();
