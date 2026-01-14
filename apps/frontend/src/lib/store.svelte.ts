import type {
  Message,
  MessagePayload,
  PublicUser,
} from "@chat/shared/src/lib/utils/validation";
import { type MessageReceipt } from "@chat/shared/src/lib/utils/validation";
import { SvelteSet } from "svelte/reactivity";
import { da } from "zod/v4/locales";



export type PrivateConversation = {
  conversation_id: number;
  user: PublicUser;
};


export type ChatEntry = {
  message: Message,
  receipt: MessageReceipt
}


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

  // TODO : CACHE MESSAGES IN BACKEND instead of local storage, when scrolling
  messages = $state<Record<string, Record<number, ChatEntry>>>({});

  // TODO : CACHED MESSAGES Array
  flatMessages = $derived.by(() => {
    const flatArray: ChatEntry[] = []
    for (const convId in this.messages) {
      for (const msgId in this.messages[convId]) {
        flatArray.push(this.messages[convId][msgId])
      }
    }
    return flatArray
  });


  async sendMessage({ messageText }: { messageText: string }) {

    let messagePayload: MessagePayload = {
      type: "message",
      id: crypto.randomUUID(),
      recipient: {
        id: this.activeConversation?.user.id!,
        username: this.activeConversation?.user.username!,
      },
      msgData: {
        message: {
          conversation_id:
            this.activeConversation?.conversation_id!,
          client_message_id: crypto.randomUUID(),
          content: messageText,
          message_type: "text",
          sender_id: this.currentUser?.id!,
        }
      },
    };



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

    if (!response?.ok) {
      this.error = "Failed to send message";
      return;
    }

    const data = await response.json();

    return data;
  }

  async initialMessages({ conversation_id }: { conversation_id: number }) {

    const user_id = this.currentUser?.id!;
    const response = await fetch(
      `http://localhost:3000/api/conversations/${conversation_id}/messages/${user_id}?limit=30`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    const data = await response.json();


    this.buildNestedMap(data.chat)

  }


  buildNestedMap(messagesArray: ChatEntry[]) {
    const newMessages: Record<string, Record<number, ChatEntry>> = {};

    for (const entry of messagesArray) {
      const convId = entry.message.conversation_id;
      const msgId = entry.message.message_id;

      if (!newMessages[convId]) {
        newMessages[convId] = {};
      }
      newMessages[convId][msgId] = entry;
    }

    this.messages = newMessages;
  }

  async clearNotification(conversation_id: number) {
    this.notifications.delete(conversation_id);
  }

  reset() {
    this.isConnected = false;
    this.currentUser = null;
    this.onlineUsers = [];
  }
}

export const chatStore = new ChatStore();
