import type {
  Message,
  MessagePayload,
  PublicUser,
  MessageReceipt,
} from "@chat/shared/src/lib/utils/validation";
import { SvelteSet } from "svelte/reactivity";

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

  // Optimized: Only get messages for the active conversation
  activeMessages = $derived.by(() => {
    if (!this.activeConversation) return [];

    const convMessages = this.messages[this.activeConversation.conversation_id];
    if (!convMessages) return [];

    // Convert to array and sort by message_id (chronological order)
    return Object.values(convMessages).sort(
      (a, b) => a.message.message_id - b.message.message_id
    );
  });

  async sendMessage({ messageText }: { messageText: string }) {
    if (!this.activeConversation || !this.currentUser) {
      this.error = "No active conversation or user";
      return;
    }

    const messagePayload: MessagePayload = {
      type: "message",
      id: crypto.randomUUID(),
      recipient: {
        id: this.activeConversation.user.id,
        username: this.activeConversation.user.username,
      },
      msgData: {
        message: {
          conversation_id: this.activeConversation.conversation_id,
          client_message_id: crypto.randomUUID(),
          content: messageText,
          message_type: "text",
          sender_id: this.currentUser.id,
        },
      },
    };

    try {
      const response = await fetch("http://localhost:3000/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          isNew: true,
          messagePayload: messagePayload,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : "Failed to send message";
      console.error("Send message error:", error);
      throw error;
    }
  }

  async loadInitialMessages({ conversation_id }: { conversation_id: number }) {
    if (!this.currentUser || !conversation_id) {
      this.error = "No current user";
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/conversations/${conversation_id}/messages/${this.currentUser.id}?limit=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load messages");
      }

      const data = await response.json();
      this.buildNestedMap(data.chat);
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : "Failed to load messages";
      console.error("Initial messages error:", error);
      throw error;
    }
  }

  // Optimized: Group by conversation first to minimize object checks
  buildNestedMap(messagesArray: ChatEntry[]) {
    // Group messages by conversation_id
    const grouped = new Map<number, ChatEntry[]>();

    for (const entry of messagesArray) {
      const convId = entry.message.conversation_id;
      if (!grouped.has(convId)) {
        grouped.set(convId, []);
      }
      grouped.get(convId)!.push(entry);
    }

    // Build nested map - only one check per conversation
    for (const [convId, entries] of grouped) {
      if (!this.messages[convId]) {
        this.messages[convId] = {};
      }

      const conversationMessages = this.messages[convId];
      for (const entry of entries) {
        conversationMessages[entry.message.message_id] = entry;
      }
    }
  }

  // Method to update messages for a specific conversation
  updateConversationMessages(
    conversationId: number,
    messagesArray: ChatEntry[]
  ) {
    this.messages[conversationId] ??= {};
    const targetConversation = this.messages[conversationId];

    for (const entry of messagesArray) {
      const msgId = entry.message.message_id;
      targetConversation[msgId] = entry;
    }
  }

  // Add a single message to a conversation
  addMessage(conversationId: number, entry: ChatEntry) {
    const msgId = entry.message.message_id;
    this.messages[conversationId] ??= {};
    this.messages[conversationId][msgId] = entry;
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

  async clearNotification(conversation_id: number) {
    this.notifications.delete(conversation_id);
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
