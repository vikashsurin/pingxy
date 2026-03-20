import type { UIConversation } from "$lib/types/chat";
import type { Message, selectMessageSchema } from "@pingxy/shared";
import { SvelteMap, SvelteSet } from "svelte/reactivity";
import type z from "zod";
import { attachmentStore } from "./attachmentStore.svelte";
import { ChatState } from "./ChatState.svelte";


export class MessageStore {


  // messageId -> message
  messages = new SvelteMap<number, any>();
  threads = new SvelteMap<number, SvelteSet<number>>();

  chats = new SvelteMap<number, ChatState>();
  chatPartners = $derived.by(() => {
    const lookup = new SvelteMap();
    for (const chat of this.chats.values()) {
      if (chat.type == "direct" && chat.partner?.id) {
        lookup.set(chat.partner.id, chat.chatId);
      }
    }
    return lookup;
  });

  activeChatId = $state<number | null>(null);

  initThreads(conversations: UIConversation[]) {
    conversations.forEach((conversation) => {
      const { conversationId } = conversation;

      // 1. Ensure the thread exists for this conversation
      if (!this.threads.has(conversationId)) {
        this.threads.set(conversationId, new SvelteSet());
      }

      // 2. Create or update ChatState
      let chat = this.chats.get(conversationId);
      if (!chat) {
        chat = new ChatState(conversationId, this);
        this.chats.set(conversationId, chat);
      }

      // 3. Map the metadata
      chat.displayName = conversation.displayName;
      chat.type = conversation.type;
      chat.partner = conversation.partner;
      chat.participants = conversation.participants;
      chat.unreadCount = conversation.unreadCount;
    });
  }

  upsertMessage(message: z.infer<typeof selectMessageSchema>) {
    // 1. Update or insert the message
    let existing = this.messages.get(message.id);
    if (existing) {
      existing = message;
    } else {
      this.messages.set(message.id, message);
    }

    // 2. Update the thread index
    const threads = this.threads.get(message.conversationId);
    if (threads) {
      threads.add(message.id);
    }
  }

  setMessages(items: Message[]) {
    for (const message of items) {
      if (!message?.id || !message?.conversationId) continue;

      // 1. Update/Insert the message data
      this.messages.set(message.id, message);

      // 2. Manage the thread index
      let threadsIds = this.threads.get(message.conversationId);
      if (!threadsIds) {
        threadsIds = new SvelteSet<number>();
        this.threads.set(message.conversationId, threadsIds);
      }

      threadsIds.add(message.id);
    }
  }

  getLastMessageId(cid: number) {
    const msg = Array.from(this.threads.get(cid) || []);
    return msg.at(-1)
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
      // entry.receipt = newReceipt;
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
        `/api/conversations/${conversationId}/messages?before=${oldestId}&limit=${limit}`,
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

      if (data.entities) {
        const { messages, receipts, attachments } = data.entities;

        for (const message of messages) {
          this.upsertMessage(message);
        }



        for (const attachment of attachments) {
          attachmentStore.upsertAttachment(attachment);
        }
      }

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
        `/api/conversations/${conversationId}/messages?after=${newestId}&limit=${limit}`,
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

      if (data.entities) {
        const { messages, receipts, attachments } = data.entities;

        for (const message of messages) {
          this.upsertMessage(message);
        }



        for (const attachment of attachments) {
          attachmentStore.upsertAttachment(attachment);
        }
      }

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
