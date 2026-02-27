import { SvelteMap } from "svelte/reactivity"
import type { ChatEntry } from "./store.svelte"



// class MessageStore {
//   // Flat storage: Message ID -> Message Object
//   // SvelteMap ensures fine-grained reactivity for adds/deletes
//   messages = new SvelteMap<string, ChatEntry>();

//   // Lookup: Chat ID -> Set of Message IDs
//   threads = new SvelteMap<string, Set<string>>();

//   // Metadata: Chat ID -> UI State (loading, typing, etc.)
//   chatMetadata = new SvelteMap<string, ChatState>();
// }

class MessageStore {

  conversations = $state<Record<number, ChatEntry[]>>({})
  messageIndex = new SvelteMap<number, ChatEntry>()

  syncMessages({ convId, items }: { convId: number, items: ChatEntry[] }) {
    if (!this.conversations[convId]) this.conversations[convId] = [];

    // 1. Add items to the reactive array first
    items.forEach(newItem => {
      const mId = newItem.message.messageId;
      if (!this.messageIndex.has(mId)) {
        // Push directly to the $state array
        this.conversations[convId].push(newItem);

        // 2. CRITICAL: Grab the REACTIVE reference from the array
        const reactiveRef = this.conversations[convId][this.conversations[convId].length - 1];

        // 3. Store the PROXY in the index
        this.messageIndex.set(mId, reactiveRef);
      }
    });
  }


  addMessage({ convId, message }: { convId: number, message: ChatEntry }) {
    if (!this.conversations[convId]) {
      this.conversations[convId] = [];
    }
    console.log('testing::: ', $state.snapshot(this.conversations[convId]))
    this.conversations[convId].push(message);

    const reactiveRef = this.conversations[convId][this.conversations[convId].length - 1];
    this.messageIndex.set(message.message.messageId, reactiveRef);
  }
}

export const messageStore = new MessageStore()
