import type {
  Message,
  MessagePayload,
  PublicUser,
  MessageReceipt,
} from "@pingxy/shared/types";
import { SvelteSet, SvelteMap } from "svelte/reactivity";
import { virtualStore } from "./virtualStore.svelte";
import { socketService } from "./socketService.svelte";

export type PrivateConversation = {
  conversation_id: number;
  user: PublicUser;
};

export type ChatEntry = {
  message: Message;
  receipt: MessageReceipt;
};

// Proper type for chat target instead of any
export type ChatTarget =
  | { isUser: true; data: PublicUser }
  | { isUser: false; data: Record<string, never> };

class ChatStore {
  isConnected = $state<boolean>(false);
  currentUser = $state<PublicUser | null | undefined>(undefined);
  error = $state<string>("");
  onlineUsers = $state<PrivateConversation[]>([]);
  searchQuery = $state<string>("");

  chatTarget = $state<ChatTarget>({
    isUser: false,
    data: {},
  });

  activeConversation = $state<{
    conversation_id: number;
    user: PublicUser;
  }>();

  conversations = $state<PrivateConversation[]>([]);
  notifications = new SvelteSet<number>();

  // Nested structure: { [conversationId]: { [messageId]: ChatEntry } }
  messages = $state<Record<number, Record<number, ChatEntry>>>({});
  unread = new SvelteMap<number, number[]>();

  // Maximum messages to keep in memory per conversation
  private readonly MESSAGE_LIMIT = 100;
  readonly LIMIT = 20;

  // Optimized: Only get messages for the active conversation
  activeMessages = $derived.by(() => {
    if (!this.activeConversation) return [];

    const convMessages = this.messages[this.activeConversation.conversation_id];
    if (!convMessages) return [];

    // Convert to array and sort by message_id (chronological order)
    return Object.values(convMessages).sort(
      (a, b) => a.message.message_id - b.message.message_id,
    );
  });

  async sendMessage({ messageText }: { messageText: string }) {
    await socketService.sendMessage({ messageText });
  }

  async loadInitialMessages({ conversation_id }: { conversation_id: number }) {
    if (!this.currentUser || !conversation_id) {
      this.error = "No current user";
      return;
    }

    try {
      const response = await fetch(
        `/api/conversations/${conversation_id}/messages/${this.currentUser.id}?limit=${this.LIMIT}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load messages");
      }

      const body = await response.json();

      virtualStore.absoluteLatestMessageId =
        body.chat.at(-1).message.message_id;

      // Initial load - just add messages without trimming
      this.messages[conversation_id] = {};
      for (const entry of body.chat) {
        this.messages[conversation_id][entry.message.message_id] = entry;
      }
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : "Failed to load messages";
      console.error("Initial messages error:", error);
      throw error;
    }
  }

  // Load older messages (scrolling UP) - trim from BOTTOM (newest)
  loadOlderMessages(conversationId: number, messagesArray: ChatEntry[]) {
    this.messages[conversationId] ??= {};
    const conversation = this.messages[conversationId];

    // Add the older messages
    for (const entry of messagesArray) {
      conversation[entry.message.message_id] = entry;
    }

    // Trim from bottom if exceeded limit
    this.trimNewest(conversationId);
  }

  // Load newer messages (scrolling DOWN) - trim from TOP (oldest)
  loadNewerMessages(conversationId: number, messagesArray: ChatEntry[]) {
    this.messages[conversationId] ??= {};
    const conversation = this.messages[conversationId];

    // Add the newer messages
    for (const entry of messagesArray) {
      conversation[entry.message.message_id] = entry;
    }

    // Trim from top if exceeded limit
    this.trimOldest(conversationId);
  }

  // Trim oldest messages (remove from TOP) - used when scrolling down
  private trimOldest(conversationId: number) {
    const conversation = this.messages[conversationId];
    if (!conversation) return;

    const messageIds = Object.keys(conversation).map(Number);

    if (messageIds.length <= this.MESSAGE_LIMIT) return;

    // Sort message IDs numerically (oldest to newest)
    messageIds.sort((a, b) => a - b);

    // Calculate how many to remove from the beginning
    const removeCount = messageIds.length - this.MESSAGE_LIMIT;
    const toRemove = messageIds.slice(0, removeCount);

    // Remove oldest messages
    for (const msgId of toRemove) {
      delete conversation[msgId];
    }
  }

  // Trim newest messages (remove from BOTTOM) - used when scrolling up
  private trimNewest(conversationId: number) {
    const conversation = this.messages[conversationId];
    if (!conversation) return;

    const messageIds = Object.keys(conversation).map(Number);

    if (messageIds.length <= this.MESSAGE_LIMIT) return;

    // Sort message IDs numerically (oldest to newest)
    messageIds.sort((a, b) => a - b);

    // Calculate how many to remove from the end
    const removeCount = messageIds.length - this.MESSAGE_LIMIT;
    const toRemove = messageIds.slice(-removeCount);

    // Remove newest messages
    for (const msgId of toRemove) {
      delete conversation[msgId];
    }
  }

  // Optimized version of buildNestedMap (for bulk initial loads)
  buildNestedMap(messagesArray: ChatEntry[]) {
    // Group messages by conversation_id first
    const grouped = new Map<number, ChatEntry[]>();

    for (const entry of messagesArray) {
      const convId = entry.message.conversation_id;
      if (!grouped.has(convId)) {
        grouped.set(convId, []);
      }
      grouped.get(convId)!.push(entry);
    }

    // Build nested map without trimming (bulk initial load)
    for (const [convId, entries] of grouped) {
      this.messages[convId] ??= {};
      for (const entry of entries) {
        this.messages[convId][entry.message.message_id] = entry;
      }
    }
  }

  // Method to update messages for a specific conversation
  updateConversationMessages(
    conversationId: number,
    messagesArray: ChatEntry[],
  ) {
    this.messages[conversationId] ??= {};

    for (const entry of messagesArray) {
      this.messages[conversationId][entry.message.message_id] = entry;
    }
  }

  // Add a single message to a conversation (new message received/sent)
  addMessage(conversationId: number, entry: ChatEntry) {
    this.messages[conversationId] ??= {};
    this.messages[conversationId][entry.message.message_id] = entry;

    // When adding new messages, trim oldest if needed
    this.trimOldest(conversationId);
  }

  // Get a message entry by conversation and message ID
  getEntry(conversationId: number, messageId: number): ChatEntry | undefined {
    return this.messages[conversationId]?.[messageId];
  }

  // Update message receipt status (used by receipt handlers)
  updateReceipt(receipt: MessageReceipt) {
    const entry = this.getEntry(receipt.conversation_id, receipt.message_id);
    if (!entry) return;

    // Direct assignment - Svelte 5 handles granular reactivity
    entry.receipt = receipt;
  }

  // Get the oldest message ID in a conversation (for loading older messages)
  getOldestMessageId(conversationId: number): number | null {
    const conversation = this.messages[conversationId];
    if (!conversation) return null;

    const messageIds = Object.keys(conversation).map(Number);
    if (messageIds.length === 0) return null;

    return Math.min(...messageIds);
  }

  // Get the newest message ID in a conversation (for loading newer messages)
  getNewestMessageId(conversationId: number): number | null {
    const conversation = this.messages[conversationId];
    if (!conversation) return null;

    const messageIds = Object.keys(conversation).map(Number);
    if (messageIds.length === 0) return null;

    return Math.max(...messageIds);
  }

  // Get current message count for a conversation
  getMessageCount(conversationId: number): number {
    const conversation = this.messages[conversationId];
    if (!conversation) return 0;
    return Object.keys(conversation).length;
  }

  // Clear messages for a specific conversation (useful when switching chats)
  clearConversationMessages(conversationId: number) {
    delete this.messages[conversationId];
  }

  async clearNotification(conversation_id: number) {
    this.notifications.delete(conversation_id);
  }

  async addUnreadMessage(conversationId: number, messageId: number) {
    const unreadMessages = this.unread.get(conversationId) || [];
    if (!unreadMessages.includes(messageId)) {
      this.unread.set(conversationId, [...unreadMessages, messageId]);
    }
  }

  reset() {
    this.isConnected = false;
    this.currentUser = null;
    this.onlineUsers = [];
    this.conversations = [];
    this.messages = {};
    this.notifications.clear();
    this.activeConversation = undefined;
    this.error = "";
  }
}

export const chatStore = new ChatStore();
