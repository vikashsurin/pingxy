import { SvelteMap } from "svelte/reactivity";
import { ChatEntry } from "./ChatEntry.svelte";
import { ChatState } from "./ChatState.svelte";

export class MessageStore {
  // Use SvelteMap for collection management
  messages = new SvelteMap<number, ChatEntry>();
  threads = new SvelteMap<number, Set<number>>();
  chats = new SvelteMap<number, ChatState>();

  upsertMessage(entryData: { message: any; receipt: any }) {
    const { messageId, conversationId } = entryData.message;

    // 1. Create or Update the Entry
    if (this.messages.has(messageId)) {
      // Fine-grained update: just update the receipt if message already exists
      const existing = this.messages.get(messageId)!;
      existing.receipt = entryData.receipt;
    } else {
      // Create a new instance of our reactive class
      this.messages.set(messageId, new ChatEntry(entryData));
    }

    // 2. Index the thread
    if (!this.threads.has(conversationId)) {
      this.threads.set(conversationId, new Set());
    }
    this.threads.get(conversationId)!.add(messageId);

    // 3. Ensure ChatState exists for this conversation
    if (!this.chats.has(conversationId)) {
      this.chats.set(conversationId, new ChatState(conversationId, this));
    }

    // 4. Update the "Latest" pointer for the sidebar preview
    this.chats.get(conversationId)!.lastMessageId = messageId;
  }
}
