import type { MessageStore } from "./messageStore.svelte";

type Partner = {
  id: number;
  username: string;
  gender: string;
  age: number;
  country: string;
};

export class ChatState {
  chatId = $state(0);
  root: MessageStore;

  isTyping = $state(false);
  private typingTimeout: any;

  // conversation metadata
  type = $state<"direct" | "group">("direct");
  displayName = $state<string>();
  lastMessageId = $state<number | null>(null);
  updatedAt = $state<Date | null>(null);
  partner = $state<null | Partner>(null);
  unreadCount = $state(0);

  participants = $state<any[]>();

  constructor(chatId: number, root: MessageStore) {
    this.chatId = chatId;
    this.root = root;
  }

  // Optimized: Direct Map lookup is reactive in Svelte 5
  lastMessage = $derived(() => {
    if (!this.lastMessageId) return null;
    return this.root.messages.get(this.lastMessageId);
  });

  handleTyping() {
    this.isTyping = true;
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => (this.isTyping = false), 3000);
  }
}
