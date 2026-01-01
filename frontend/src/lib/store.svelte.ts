import { SvelteMap, SvelteSet } from "svelte/reactivity";
import {
  type Message,
  type User,
  messageSchema,
  type ChatTarget,
} from "../../../shared/src/lib/utils/validation.js";
import { getSocket } from "./socket.svelte";

class ChatStore {
  currentUser = $state<User | null>(null);

  users = new SvelteMap<string, User>();
  unread = new SvelteMap<string, number>();
  messages = new SvelteMap<string, Message[]>();
  typingUsers = new SvelteSet<string>();

  //TODO: create different state for room chats and user chats
  // userChatMessages = new SvelteMap<string, Message[]>();
  // roomChatMessages = new SvelteMap<string, Message[]>();

  searchQuery = $state({
    value: "",
  });

  reset() {
    this.currentUser = null;
    this.users.clear();
    this.unread.clear();
    this.messages.clear();
    this.typingUsers.clear();
    this.searchQuery.value = "";
    this.activeChatTarget = null;
  }

  activeChatTarget = $state<ChatTarget | null>(null);

  recentChatIds = $derived(new Set(this.messages.keys()));

  recentChats = $derived.by(() => {
    const recentTargets: ChatTarget[] = [];
    for (const uid of this.recentChatIds) {
      const user = this.users.get(uid);
      if (user) {
        recentTargets.push(user);
      }
    }
    return recentTargets;
  });

  addUnread(uid: string) {
    const count = this.unread.get(uid) || 0;
    this.unread.set(uid, count + 1);
  }

  resetUnread(uid: string) {
    this.unread.delete(uid);
  }

  setTyping(uid: string, isTyping: boolean) {
    if (isTyping) {
      this.typingUsers.add(uid);
    } else {
      this.typingUsers.delete(uid);
    }
  }

  // --- Business Logic ---
  typingTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

  handleTyping() {
    if (!this.activeChatTarget?.uid || !this.currentUser) return;

    const socket = getSocket();
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    // Send "start typing"
    socket.send(
      JSON.stringify({
        type: "typing",
        isTyping: true,
        senderId: this.currentUser.uid,
        recipientId: this.activeChatTarget.uid,
      })
    );

    // Clear existing timeout
    if (this.typingTimeout) clearTimeout(this.typingTimeout);

    // Set new timeout to stop typing
    this.typingTimeout = setTimeout(() => {
      if (
        socket &&
        socket.readyState === WebSocket.OPEN &&
        this.currentUser &&
        this.activeChatTarget
      ) {
        socket.send(
          JSON.stringify({
            type: "typing",
            isTyping: false,
            senderId: this.currentUser.uid,
            recipientId: this.activeChatTarget.uid,
          })
        );
      }
    }, 2000);
  }

  sendMessage(content: string) {
    // Pre-validation checks
    const trimmedMessage = content.trim();
    if (!trimmedMessage) return;

    if (trimmedMessage.length > 5000) {
      console.error("Message too long");
      return; // TODO: Add toast
    }

    const socket = getSocket();
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error("Socket not connected");
      return; // TODO: Add toast
    }

    if (!this.activeChatTarget?.uid || !this.currentUser) {
      console.error("No active chat or user");
      return;
    }

    // Create message
    const msg: Message = {
      id: crypto.randomUUID(),
      type: "message",
      kind: "chat",
      content: trimmedMessage,
      senderId: this.currentUser.uid,
      senderName: this.currentUser.username,
      // Logic for Room vs DM
      recipientId: this.activeChatTarget.uid,
      timestamp: Date.now(),
    };

    // Schema validation
    const validateMessage = messageSchema.safeParse(msg);
    if (!validateMessage.success) {
      console.error("Validation error:", validateMessage.error);
      return;
    }

    const validMessage = validateMessage.data;

    // Optimistic UI update
    const currentList = this.messages.get(this.activeChatTarget.uid) || [];
    this.messages.set(this.activeChatTarget.uid, [
      ...currentList,
      validMessage,
    ]);

    // If sending to self, ignore socket send
    if (validMessage.senderId === validMessage.recipientId) {
      return;
    }

    // Send with error handling
    try {
      socket.send(JSON.stringify(validMessage));
    } catch (error) {
      console.error("Send failed:", error);

      // Rollback
      const rolledBackList = (
        this.messages.get(this.activeChatTarget.uid) || []
      ).filter((m) => m.id !== validMessage.id);
      this.messages.set(this.activeChatTarget.uid, rolledBackList);
    }
  }
}

export const chatStore = new ChatStore();
