import { SvelteMap, SvelteSet } from "svelte/reactivity";
import { chatStore } from "./store.svelte";

export class ChatState {
  conversationId = $state<number>(0);
  myPid = $state<number | undefined>();

  root: ConversationStore;

  constructor(conversationId: number, root: ConversationStore) {
    this.conversationId = conversationId;

    this.root = root;

    Object.defineProperty(this, "root", {
      value: root,
      enumerable: false,
      writable: false,
    });
  }

  // conversation states
  isTyping = $state(false);
  unreadCount = new SvelteMap<number, number>();

  // TODO online presence
  isOnline = $state(false);
  // unread = $derived(this.myPid ? (this.unreadCount.get(this.myPid) ?? 0) : 0);

  private typingTimeout: ReturnType<typeof setTimeout> | undefined;

  handleTyping() {
    this.isTyping = true;
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => (this.isTyping = false), 3000);
  }

  setUnreadCount(count: number) {
    if (this.myPid !== undefined) {
      this.unreadCount.set(this.myPid, count);
    }
  }

  getUnreadCount() {
    if (this.myPid) {
      return this.unreadCount.get(this.myPid);
    }
  }

  incrementUnreadCount() {
    if (this.myPid) {
      const count = this.unreadCount.get(this.myPid) || 0;
      this.unreadCount.set(this.myPid, count + 1);
    }
  }

  resetUnreadCount() {
    // const pid = this.root.getMyPid(this.conversationId);
    if (this.myPid) {
      this.unreadCount.set(this.myPid, 0);
    }
  }

  // Presence
  setOnline() {
    this.isOnline = true;
  }
  setOffline() {}
  getPresence() {
    return this.isOnline ? "online" : "offline";
  }
}

class ConversationStore {
  chatState = new SvelteMap<number, ChatState>();

  myUserId = $derived(chatStore.user?.id);

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

  // conversationId -> myPid
  ci = new SvelteMap<number, number>();

  getMyPid(cid: number) {
    return this.ci.get(cid);
  }

  getPartnerId(cid: number) {
    const user = chatStore.user;

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
        const myPid = this.ci.get(id);
        const state = this.chatState.get(id);
        const partnerUid = this.getPartnerId(id);

        return {
          ...this.cm.get(id),
          participants: this.cp.get(id) ?? new SvelteSet<number>(),
          partnerUid: partnerUid,
          state: state,
        };
      })
      .toSorted((a, b) => b.lastMessageId - a.lastMessageId);
  });

  upsertConversation(c: any) {
    const id = c.id;
    const wasMissing = !this.cm.has(id);

    this.cm.set(id, c);

    if (wasMissing) {
      this.convIds.push(id);
    }
  }

  initializeChatState(item: any) {
    const state = new ChatState(item.id, this);
    this.chatState.set(item.id, state);
  }

  seedFromConversations(items: any[]) {
    for (const item of items) {
      this.upsertConversation(item);
      this.initializeChatState(item);
    }
  }

  seedFromParticipants(items: any[]) {
    // Grab the value once to avoid unnecessary re-reads of the derived property
    const currentUid = this.myUserId;

    for (const item of items) {
      const cid = item.conversationId;
      const pid = item.id;
      const uid = item.userId;

      // 1. Basic Mappings
      let set = this.cp.get(cid) ?? new SvelteSet<number>();
      set.add(pid);
      this.cp.set(cid, set);
      this.pu.set(pid, uid);
      this.uc.set(uid, cid);

      // 2. Identify "Me" and Update State
      const state = this.chatState.get(cid);
      if (state && uid === currentUid) {
        state.myPid = pid; // Correctly assign identity
        this.ci.set(cid, pid); // Update root mapping
        state.setUnreadCount(item.unreadCount); // Set the count for ME
      }
    }
  }
}
export const conversationStore = new ConversationStore();
