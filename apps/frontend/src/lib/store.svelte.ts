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

class ChatStore {
  isConnected = $state<boolean>(false);
  currentUser = $state<PublicUser | null | undefined>(undefined);
  error = $state<string>("");
  onlineUsers = $state<PrivateConversation[]>([]);
  searchQuery = $state<string>("");

  chatTarget = $state<{
    isUser: boolean;
    data: { [key: string]: any };
  }>({
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

  // Derived flat messages array for general operations
  flatMessages = $derived.by(() => {
    const flatArray: ChatEntry[] = [];
    for (const convId in this.messages) {
      for (const msgId in this.messages[convId]) {
        flatArray.push(this.messages[convId][msgId]);
      }
    }
    return flatArray;
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
    if (!this.currentUser) {
      this.error = "No current user";
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/conversations/${conversation_id}/messages/${this.currentUser.id}?limit=30`,
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

  buildNestedMap(messagesArray: ChatEntry[]) {
    for (const entry of messagesArray) {
      const convId = entry.message.conversation_id;
      const msgId = entry.message.message_id;

      if (!this.messages[convId]) {
        this.messages[convId] = {};
      }

      this.messages[convId][msgId] = entry;
    }
  }

  // Method to update messages for a specific conversation
  // Method to update messages for a specific conversation
  updateConversationMessages(
    conversationId: number,
    messagesArray: ChatEntry[]
  ) {
    if (!this.messages[conversationId]) {
      this.messages[conversationId] = {};
    }

    const targetConversation = this.messages[conversationId];

    for (const entry of messagesArray) {
      const msgId = entry.message.message_id;
      targetConversation[msgId] = entry;
    }
  }

  // Add a single message to a conversation
  // Add a single message to a conversation
  addMessage(conversationId: number, entry: ChatEntry) {
    const msgId = entry.message.message_id;

    if (!this.messages[conversationId]) {
      this.messages[conversationId] = {};
    }

    this.messages[conversationId][msgId] = entry;
  }

  // Get a message entry by conversation and message ID
  getEntry(conversationId: number, messageId: number): ChatEntry | undefined {
    return this.messages[conversationId]?.[messageId];
  }

  // Update message receipt status (used by receipt handlers)
  // Update message receipt status (used by receipt handlers)
  updateReceipt(receipt: MessageReceipt) {
    const entry = this.getEntry(receipt.conversation_id, receipt.message_id);

    if (!entry) return;

    // Direct mutation triggers granular reactivity in Svelte 5
    entry.receipt = { ...receipt };
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
