import { MessageStore } from "./_messageStore.svelte";

export class ChatState {
  chatId: number;
  root: MessageStore;

  // 1. Ephemeral UI State (Volatile)
  isTyping = $state(false);
  private typingTimeout: any;

  // 2. Pointer to the latest data
  lastMessageId = $state<number | null>(null);

  constructor(chatId: number, root: any) {
    this.chatId = chatId;
    this.root = root;
  }

  // 3. Derived Logic: The Latest Message Preview
  // Only re-calculates if lastMessageId changes or that specific message is updated
  lastMessage = $derived(() => {
    if (!this.lastMessageId) return null;
    return this.root.messages.get(this.lastMessageId);
  });

  // 4. Derived Logic: The Unread Badge
  // Automatically updates when any message status in this thread changes to 'read'
  unreadCount = $derived(() => {
    const threadIds = this.root.threads.get(this.chatId);
    if (!threadIds) return 0;

    let count = 0;
    for (const id of threadIds) {
      const entry = this.root.messages.get(id);
      // Logic: If message exists, isn't from me, and isn't read
      if (entry && !entry.isMe && entry.status !== 'read') {
        count++;
      }
    }
    return count;
  });

  // 5. Action: Manage Typing Indicators
  // Use a timer to automatically clear the "typing..." state
  handleTyping() {
    this.isTyping = true;
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.isTyping = false;
    }, 3000); // 3 seconds expiry
  }

  // 6. Action: Mark Conversation as Read
  // This updates the 'receipt' inside the MessageStore objects
  markAsRead() {
    const threadIds = this.root.threads.get(this.chatId);
    if (!threadIds) return;

    threadIds.forEach((id: number) => {
      const entry = this.root.messages.get(id);
      if (entry && !entry.isMe && entry.status !== 'read') {
        // Mutation here triggers the derived unreadCount above!
        entry.receipt.status = 'read';
      }
    });
  }
}
