import { SvelteMap, SvelteSet } from "svelte/reactivity";
import { ChatEntry } from "./ChatEntry.svelte";
import { ChatState } from "./ChatState.svelte";
import { th } from "zod/v4/locales";
import type { UIConversation } from "$lib/types/chat";

type Conversation = {
  conversationId: number,
  unreadCount: number,
  type: 'direct' | 'group',
  displayName: string,
  lastMessageId: number,
  updatedAt: Date,
  partner: {
    id: number,
    username: string,
    gender: string,
    age: number,
    country: string
  }
  participants: any[]

}


// implement messagesMetadata.
export class MessageStore {
  // Use SvelteMap for collection management
  messages = new SvelteMap<number, ChatEntry>();
  threads = new SvelteMap<number, SvelteSet<number>>();
  chats = new SvelteMap<number, ChatState>();

  activeChatId = $state<number | null>(null);


  initThreads(conversations: UIConversation[]) {
    conversations.forEach((conversation) => {
      const { conversationId } = conversation;

      // 1. Ensure the thread exists for this conversation
      if (!this.threads.has(conversationId)) {
        this.threads.set(conversationId, new SvelteSet());
      }

      // 2. Create or update ChatState
      let chat = this.chats.get(conversationId)
      if (!chat) {
        chat = new ChatState(conversationId, this)
        this.chats.set(conversationId, chat)
      }


      // 3. Map the metadata
      chat.displayName = conversation.displayName;
      chat.type = conversation.type;
      chat.partner = conversation.partner;
      chat.participants = conversation.participants;
      chat.unreadCount = conversation.unreadCount;
    });

  }


  // Inside MessageStore.svelte.ts
  upsertMessage(payload: any) {
    const { messageId, conversationId } = payload.message;

    const existing = this.messages.get(messageId);

    // 1. Update the message Map
    // Use a check to avoid re-creating the object if it already exists (optional optimization)

    if (existing) {
      // existing.receipt = payload.receipt;
    } else {
      this.messages.set(messageId, new ChatEntry(payload));
    }

    // 2. Update the threads Map (The Set of IDs for this conversation)
    let threadIds = this.threads.get(conversationId);
    if (!threadIds) {
      threadIds = new SvelteSet();
      this.threads.set(conversationId, threadIds);
    }
    threadIds.add(messageId);

    // 3. Update ChatState pointers
    let chat = this.chats.get(conversationId);
    if (!chat) {
      // This handles messages from chats not yet in the sidebar
      chat = new ChatState(conversationId, this);
      this.chats.set(conversationId, chat);
    }

    // Update the pointer for the "Last Message" preview in sidebar
    chat.lastMessageId = messageId;

    // Update timestamp for sidebar sorting (Add a 'lastActivity' field to ChatState)
    // chat.lastActivity = payload.message.createdAt;
  }

  setMessages(items: any[]) {
    items.forEach((item: any) => {
      this.upsertMessage(item);
    });
  }

  getMessages(chatId: number) {
    if (this.threads.has(chatId)) return this.threads.get(chatId);

    // // 2. If not, pull from IndexedDB (Disk)
    //   const localMsgs = await db.messages.where({ chatId }).toArray();

    //   // 3. Hydrate the Svelte Store with local data
    //   this.hydrate(localMsgs);

    //   // 4. Background fetch from API to get the latest (Network)
    //   this.syncEngine.fetchLatest(chatId);
  }

  // Inside MessageStore
  updateReceipt({ msgId, newReceipt }: { msgId: number; newReceipt: any }) {
    const entry = this.messages.get(msgId);
    if (entry) {
      // Re-assigning the whole object triggers the update
      entry.receipt = newReceipt;
    }
  }

  async fetchOlderMessages({
    conversationId,
    userId,
    oldestId,
    limit,
  }: {
    conversationId: number;
    userId: number;
    oldestId: number;
    limit: number;
  }) {
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages/${userId}?before=${oldestId}&limit=${limit}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      data.items.forEach((item: any) => {
        this.upsertMessage(item);
      });

      return data;
    } catch (error) {
      console.error("Failed to fetch messages");
      throw error;
    }
  }
  async fetchNewerMessages({
    conversationId,
    userId,
    newestId,
    limit,
  }: {
    conversationId: number;
    userId: number;
    newestId: number;
    limit: number;
  }) {
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages/${userId}?after=${newestId}&limit=${limit}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      data.items.forEach((item: any) => {
        this.upsertMessage(item);
      });

      return data;
    } catch (error) {
      console.error("Failed to fetch messages");
      throw error;
    }
  }
}

// const response = await fetch(
//   `/api/conversations/${params.conversationId}/messages/${params.userId}?after=${newestId}&limit=${params.limit}`,
//   {
//     method: "GET",
//     headers: { "Content-Type": "application/json" },
//     credentials: "include",
//   },
// );
export const messageStore = new MessageStore();
