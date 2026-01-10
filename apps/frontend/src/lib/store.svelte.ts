import type {
  Message,
  MessagePayload,
  PublicUser,
} from "@chat/shared/src/lib/utils/validation";
import { SvelteMap, SvelteSet } from "svelte/reactivity";
import { type Conversation } from "@chat/shared/src/lib/utils/validation";



export type PrivateConversation = {
  conversation_id: number;
  user: PublicUser;
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

  activeConversationId = $state<number | null>(null);

  conversations = $state<PrivateConversation[]>([]);

  // notifications = new SvelteMap<number, boolean>();
  notifications = new SvelteSet<number>();

  messages = new SvelteMap<number, Message[]>();

  conversationsList = $state<Conversation[]>([]);


  async sendMessage({ messageText }: { messageText: string }) {

    let messagePayload: MessagePayload = {
      type: "message",
      id: crypto.randomUUID(),
      recipient: {
        id: this.activeConversation?.user.id!,
        username: this.activeConversation?.user.username!,
      },
      message: {
        conversation_id: this.activeConversation?.conversation_id!,
        client_message_id: crypto.randomUUID(),
        content: messageText,
        message_type: "text",
        sender_id: this.currentUser?.id!,
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


  async loadMessages({ conversation_id }: { conversation_id: number }) {
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
    const reactiveMessages = $state(data.messages.reverse());
    this.messages.set(conversation_id, reactiveMessages);
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
