import type { Message, MessageReceipt, User } from "@pingxy/shared/types/index";
import { SvelteMap, SvelteSet } from "svelte/reactivity";
import * as messageManager from "./managers/entities/message.svelte";
import { fetchConversation } from "./services/api";

export type PrivateConversation = {
  conversationId: number | null | undefined;
  user: User;
};

export type ChatEntry = {
  message: Message;
  receipt: MessageReceipt;
};

// Proper type for chat target instead of any
export type ChatTarget =
  | { isUser: true; data: User }
  | { isUser: false; data: Record<string, never> };

class ChatStore {
  isConnected = $state<boolean>(false);
  currentUser = $state<User | null | undefined>(undefined);
  error = $state<string>("");
  onlineUsers = $state<User[]>([]);
  searchQuery = $state<string>("");

  chatTarget = $state<ChatTarget>({
    isUser: false,
    data: {},
  });

  activeConversation = $state<PrivateConversation>();

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
    if (!this.activeConversation || !this.activeConversation.conversationId)
      return [];

    const convMessages = this.messages[this.activeConversation.conversationId];
    if (!convMessages) return [];

    // Convert to array and sort by messageId (chronological order)
    return Object.values(convMessages).sort(
      (a, b) => a.message.messageId - b.message.messageId,
    );
  });

  async sendMessage({ messageText }: { messageText: string }) {
    await messageManager.sendMessage({ messageText });
  }

  async initChat(user: User) {
    const currentUserId: number = chatStore.currentUser?.id!;
    const userId: number = user.id;

    const conversation = await fetchConversation({ currentUserId, userId });

    if (!conversation) {
      this.setActiveConversation({
        conversationId: null,
        user: user,
      });
      this.setActiveConversation({
        conversationId: conversation.conversationId,
        user: user,
      });
    } else {
    }
    return;
  }

  setActiveConversation({ conversationId, user }: PrivateConversation) {
    chatStore.activeConversation = {
      conversationId: conversationId,
      user: user,
    };
  }

  async loadInitialMessages({ conversationId }: { conversationId: number }) {
    if (this.currentUser) {
      const currentUserId = this.currentUser.id;
      const limit = this.LIMIT;
      await messageManager.loadInitialMessages({
        conversationId,
        currentUserId,
        limit,
      });
    }
  }

  // Load older messages (scrolling UP) - trim from BOTTOM (newest)
  loadOlderMessages(conversationId: number, messagesArray: ChatEntry[]) {
    this.messages[conversationId] ??= {};
    const conversation = this.messages[conversationId];

    // Add the older messages
    for (const entry of messagesArray) {
      conversation[entry.message.messageId] = entry;
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
      conversation[entry.message.messageId] = entry;
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
    // Group messages by conversationId first
    const grouped = new Map<number, ChatEntry[]>();

    for (const entry of messagesArray) {
      const convId = entry.message.conversationId;
      if (!grouped.has(convId)) {
        grouped.set(convId, []);
      }
      grouped.get(convId)!.push(entry);
    }

    // Build nested map without trimming (bulk initial load)
    for (const [convId, entries] of grouped) {
      this.messages[convId] ??= {};
      for (const entry of entries) {
        this.messages[convId][entry.message.messageId] = entry;
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
      this.messages[conversationId][entry.message.messageId] = entry;
    }
  }


  // Get a message entry by conversation and message ID
  getEntry(conversationId: number, messageId: number): ChatEntry | undefined {
    return this.messages[conversationId]?.[messageId];
  }

  // Update message receipt status (used by receipt handlers)
  updateReceipt(receipt: MessageReceipt) {
    const entry = this.getEntry(receipt.conversationId, receipt.messageId);
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

  async clearNotification(conversationId: number) {
    this.notifications.delete(conversationId);
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
