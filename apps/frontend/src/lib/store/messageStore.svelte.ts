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
}

export const messageStore = new MessageStore();
