import type { Message, MessageReceipt, User } from "@pingxy/shared/types/index";
import { SvelteMap, SvelteSet } from "svelte/reactivity";
import * as messageManager from "./managers/entities/message.svelte";
import { fetchConversation } from "./services/api";
import { handleIncomingReceipts } from "./managers/entities/receipt.svelte";

type UserWithStatus = User & { isOnline: boolean };

export type PrivateConversation = {
  unreadCount: number;
  conversationId: number | null | undefined;
  user: User;
};

export type ChatEntry = {
  message: Message;
  receipt: MessageReceipt;
};

type Target =
  | { isUser: true; user: User }
  | { isUser: false; user: User; conversationId: number; unreadCount: number };

class ChatStore {
  isConnected = $state<boolean>(false);
  currentUser = $state<User | null | undefined>(undefined);
  error = $state<string>("");
  onlineUsers = $state<User[]>([]);
  searchQuery = $state<string>("");

  target = $state<Target | null>(null);

  activeConversation = $state<PrivateConversation>();

  conversations = $state<Record<number, PrivateConversation>>({});

  displayConversations = $derived.by(
    (): (PrivateConversation & { user: UserWithStatus })[] => {
      const onlineMap = new Map(this.onlineUsers.map((u) => [u.id, u]));

      return Object.values(this.conversations).map((convo) => ({
        ...convo,
        user: {
          ...convo.user,
          isOnline: onlineMap.has(convo.user.id),
        },
      }));
    },
  );

  totalUnreadCount = $derived.by(() => {
    return Object.values(this.conversations).reduce(
      (acc, conv) => acc + (conv.unreadCount || 0),
      0,
    );
  });

  hasUnreadMessages = $derived(this.totalUnreadCount > 0);

  pendingReceipts = $state<Record<number, MessageReceipt[]>>({});

  notifications = new SvelteSet<number>();

  // Nested structure: { [conversationId]: { [messageId]: ChatEntry } }
  messages = $state<Record<number, Record<number, ChatEntry>>>({});
  unread = new SvelteMap<number, number[]>();

  blockedUserIds = $state<Set<number>>(new Set());

  // Maximum messages to keep in memory per conversation
  private readonly MESSAGE_LIMIT = 100;
  readonly LIMIT = 20;

  // Optimized: Only get messages for the active conversation
  // Format : messages: { [messageId]: {ChatEntry}, [messageId]: {ChatEntry} }
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
        unreadCount: 0,
        conversationId: null,
        user: user,
      });
    } else {
      this.setActiveConversation({
        unreadCount: 0,
        conversationId: conversation.conversationId,
        user: user,
      });
    }

    return;
  }

  setActiveConversation({ conversationId, user }: PrivateConversation) {
    chatStore.activeConversation = {
      unreadCount: 0,
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

  async clearNotification(conversationId: number) {
    this.notifications.delete(conversationId);
  }

  drainPendingReceipts(conversationId: number) {
    const receipts = this.pendingReceipts[conversationId];

    if (receipts && receipts.length > 0) {
      console.log(
        `Draining ${receipts.length} receipts for conversation ${conversationId}`,
      );

      // Reuse your existing logic
      handleIncomingReceipts(receipts);

      // Clear the memory
      delete this.pendingReceipts[conversationId];
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
