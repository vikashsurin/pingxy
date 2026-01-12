import type {
  Message,
  MessagePayload,
  PublicUser,
} from "@chat/shared/src/lib/utils/validation";
import { SvelteMap, SvelteSet } from "svelte/reactivity";
import { type Conversation, type MessageReceipt } from "@chat/shared/src/lib/utils/validation";
import { getSocket } from "./socket.svelte";



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

  activeConversationId = $state<number | null>(null);

  conversations = $state<PrivateConversation[]>([]);

  // notifications = new SvelteMap<number, boolean>();
  notifications = new SvelteSet<number>();

  // messages = new SvelteMap<number, Message[]>();

  conversationsList = $state<Conversation[]>([]);

  receipts = new SvelteMap<number, MessageReceipt>();

  // messages = new SvelteMap<number, SvelteMap<number, ChatEntry>>();
  messages = $state<Record<string, Record<number, ChatEntry>>>({});

  preloadedMessages = $state<ChatEntry[]>([])


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

  async preloadMessages({ conversation_id }: { conversation_id: number }) {
    // const conversation_id = this.activeConversation?.conversation_id!;

    const user_id = this.currentUser?.id!;
    const response = await fetch(
      `http://localhost:3000/api/conversations/${conversation_id}/${user_id}/messages`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    const data = await response.json();

    this.preloadedMessages = data.result.reverse()


    // this.buildNestedMap(reactiveMessages)
  }

  async loadMessages() {
    // const conversation_id = this.activeConversation?.conversation_id!;

    // const user_id = this.currentUser?.id!;
    // const response = await fetch(
    //   `http://localhost:3000/api/conversations/${conversation_id}/${user_id}/messages`,
    //   {
    //     method: "GET",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     credentials: "include",
    //   },
    // );
    // const data = await response.json();

    // const reactiveMessages = $state(data.result.reverse());

    console.log({ pd: this.preloadedMessages })

    this.buildNestedMap(this.preloadedMessages)
  }

  // addChatEntry(convId: number, newEntry: ChatEntry) {

  //   let convMap = this.messages.get(convId);
  //   if (!convMap) {
  //     convMap = new SvelteMap<number, ChatEntry>();
  //     this.messages.set(convId, convMap);
  //   }

  //   const msgId = newEntry.message.message_id;
  //   convMap.set(msgId, newEntry);
  // }

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

  // buildNestedMap(messagesArray: ChatEntry[]) {
  //   for (const entry of messagesArray) {

  //     const reactiveEntry = $state(entry)

  //     const convId = reactiveEntry.message.conversation_id;
  //     const msgId = reactiveEntry.message.message_id;

  //     let convMap = this.messages.get(convId);
  //     if (!convMap) {
  //       convMap = new SvelteMap<number, ChatEntry>();
  //       this.messages.set(convId, convMap);
  //     }

  //     convMap.set(msgId, reactiveEntry);
  //   }

  //   this.messages = this.messages
  // }


  async clearNotification(conversation_id: number) {
    this.notifications.delete(conversation_id);
  }


  async markAllAsRead(recipient_id: number) {
    const socket = getSocket()
    if (socket && socket.readyState === WebSocket.OPEN) {
      const msgPayload: MessagePayload = {
        type: "mark_all_as_read",
        id: crypto.randomUUID(),
        recipient: {
          id: recipient_id,
        },
        data: {
          conversation_id:
            chatStore.activeConversation?.conversation_id!,
          user_id: chatStore.currentUser?.id!,
        },
      };
      socket.send(JSON.stringify(msgPayload));
    }
  }


  async markAsRead(message_id: number) {
    const socket = getSocket()
    if (socket && socket.readyState === WebSocket.OPEN) {
      const msgPayload: MessagePayload = {
        type: "mark_as_read",
        id: crypto.randomUUID(),
        data: {
          message_id,
          user_id: chatStore.currentUser?.id!,
        },
      };
      socket.send(JSON.stringify(msgPayload));
    }
  }

  reset() {
    this.isConnected = false;
    this.currentUser = null;
    this.onlineUsers = [];
  }
}

export const chatStore = new ChatStore();
