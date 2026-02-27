// ChatState.ts
import type { MessageStore } from "./messageStore.svelte";

export class ChatState {
  chatId = $state(0);
  root: MessageStore;

  isTyping = $state(false);
  private typingTimeout: any;
  lastMessageId = $state<number | null>(null);

  constructor(chatId: number, root: MessageStore) {
    this.chatId = chatId;
    this.root = root;
  }

  // Optimized: Direct Map lookup is reactive in Svelte 5
  lastMessage = $derived(() => {
    if (!this.lastMessageId) return null;
    return this.root.messages.get(this.lastMessageId);
  });

  unreadCount = $derived(() => {
    // Svelte tracks this Map access.
    // It will re-run when messageStore.threads.set(this.chatId, ...) is called.
    const threadIds = this.root.threads.get(this.chatId);
    if (!threadIds) return 0;

    let count = 0;
    for (const id of threadIds) {
      const entry = this.root.messages.get(id);
      // Fine-grained: tracks entry.status because it's a $state property in ChatEntry
      if (entry && !entry.isMe && entry.status !== "read") {
        count++;
      }
    }
    return count;
  });

  handleTyping() {
    this.isTyping = true;
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => (this.isTyping = false), 3000);
  }

  markAsRead() {
    const threadIds = this.root.threads.get(this.chatId);
    if (!threadIds) return;

    // We don't need to re-set the thread Map here because
    // we are mutating the ChatEntry's internal $state, not the list of IDs.
    threadIds.forEach((id) => {
      const entry = this.root.messages.get(id);
      if (entry && !entry.isMe && entry.status !== "read") {
        entry.receipt.status = "read";
      }
    });
  }
}
