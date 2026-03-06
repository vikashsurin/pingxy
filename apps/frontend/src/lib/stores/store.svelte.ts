import type { UIConversation } from "$lib/types/chat";
import type { blockedUserInfoSchema } from "@pingxy/shared";
import type { Message, MessageReceipt, User } from "@pingxy/shared/types/index";
import { tick } from "svelte";
import { SvelteMap, SvelteSet } from "svelte/reactivity";
import type z from "zod";


export type Conversation = {
  id: number;
  type: "direct" | "group";
  unreadCount: number;
  name: string;
  participants: User[];
};

type HydratedParticipant = {
  participantId: number;
  conversationId: number;
  userId: number;
  role: "member" | "admin" | "moderator";
  joinedAt: string;
  leftAt: null;
  isActive: true;
  username: string;
  userType: "user" | "guest";
  data: {
    gender: string;
    age: number;
    country: string;
    roles: string[];
  };
};

export type ChatTarget = {
  isUser: boolean;
  type: "direct" | "group";
  displayName: string;
  partner?: {
    id: number;
    username: string;
    gender: string;
    age: number;
    country: string;
  };
  unreadCount?: number;
  participants?: HydratedParticipant[];
  conversationId?: number;
};

export type ChatEntry = {
  message: Message;
  receipt: MessageReceipt;
};

class ChatStore {
  private timer: ReturnType<typeof setTimeout> | null = null;
  isConnected = $state<boolean>(false);
  currentUser = $state<User | null | undefined>(undefined);
  errorMessage = $state<string>("");

  async setErrorMessage(msg: string) {
    // 1. Reset the logic
    if (this.timer) clearTimeout(this.timer);

    // 2. Clear the message briefly if it's the SAME error
    // to ensure the {#key} block sees a change
    if (this.errorMessage === msg) {
      this.errorMessage = "";
    }
    await tick();
    // 3. Set new message (wrapped in a tiny timeout if it was the same msg)
    setTimeout(() => {
      this.errorMessage = msg;

      // 4. Start fresh 5s countdown
      this.timer = setTimeout(() => {
        this.errorMessage = "";
        this.timer = null;
      }, 5000);
    }, 10);
  }

  chatTarget = $state<ChatTarget | null>(null);


  blockedUserIds = new SvelteSet<number>();
  onlineUsers = $state<User[]>([]);
  visibleOnlineUsers = $derived.by<User[]>(() => {
    return this.onlineUsers.filter((u) => !this.blockedUserIds.has(u.id));
  });


  _conversations = $state<Record<number, UIConversation>>({});



  pendingReceipts = $state<Record<number, MessageReceipt[]>>({});



  unread = new SvelteMap<number, number[]>();

  blockedUsers = $state<z.infer<typeof blockedUserInfoSchema>[]>([]);

  // Maximum messages to keep in memory per conversation
  // private readonly MESSAGE_LIMIT = 100;
  readonly LIMIT = 20;




  reset() {
    this.isConnected = false;
    this.currentUser = null;
    this.onlineUsers = [];
    // this.error = "";
  }
}

export const chatStore = new ChatStore();
