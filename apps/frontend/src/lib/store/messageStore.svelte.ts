import { SvelteMap, SvelteSet } from "svelte/reactivity";
import { ChatEntry } from "./ChatEntry.svelte";
import { ChatState } from "./ChatState.svelte";

export class MessageStore {
  // Use SvelteMap for collection management
  messages = new SvelteMap<number, ChatEntry>();
  threads = new SvelteMap<number, SvelteSet<number>>();
  chats = new SvelteMap<number, ChatState>();

  activeChatId = $state<number | null>(null);

  // Inside MessageStore.svelte.ts
  upsertMessage(payload: any) {
    console.log("upsert message called!")
    const { messageId, conversationId } = payload.message;

    // 1. Update the message Map
    this.messages.set(messageId, new ChatEntry(payload));
    // this.threads.set(conversationId, new SvelteSet(messageId))

    // 2. Update the threads Map
    let threadIds = this.threads.get(conversationId);
    if (!threadIds) {
      threadIds = new SvelteSet();
      this.threads.set(conversationId, threadIds);
    }

    threadIds.add(messageId);

    // 3. Update ChatState pointers
    const chat = this.chats.get(conversationId);
    if (chat) {
      chat.lastMessageId = messageId;
    } else {
      const newState = new ChatState(conversationId, this);
      newState.lastMessageId = messageId;
      this.chats.set(conversationId, newState);
    }
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

      // data.items.forEach((item: any) => {
      //   this.upsertMessage(item);
      // });

      console.log("older messages: ", data);
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
