import { SvelteMap, SvelteSet } from "svelte/reactivity";
import { type Message, type User, messageSchema, type ChatTarget, type Room } from "../../../shared/src/lib/utils/validation.js";
import { getSocket } from "./socket.svelte";

class ChatStore {
  currentUser = $state<User | null>(null);
  
  users = new SvelteMap<string, User>();
  rooms = new SvelteMap<string, Room>();
  unread = new SvelteMap<string, number>();
  messages = new SvelteMap<string, Message[]>();
  typingUsers = new SvelteSet<string>();



  searchQuery = $state({
    value: "",
  });

  activeChat = $state<ChatTarget>({
    uid: "global",
    name: "Global Chat",
    type: "public"
  } as Room);


  recentChatIds = $derived(new Set(this.messages.keys()));

  recentChats = $derived.by(() => {
    const recentTargets: ChatTarget[] = [];

    // Always add active rooms (from availableRooms that we have messages for OR are global)
    // For now, let's just show "global" pinned.
    const globalRoom = this.rooms.get("global");
    if (globalRoom) {
      recentTargets.push(globalRoom);
    }

    // In current simplified logic, rooms are "joined" if they are in availableRooms AND we have messages? 
    // Or do we want to explicitly double check rooms we've chatted in.
    // Let's stick to the previous recent logic but filter out duplicates.

    for (const uid of this.recentChatIds) {
      if (uid === "global") continue;

      if (this.rooms.has(uid)) {
        recentTargets.push(this.rooms.get(uid)!);
        continue;
      }

      const user = this.users.get(uid);
      if (user) {
        if (user.uid === 'global') continue;
        recentTargets.push(user);
      }
    }

    return recentTargets;
  });

  // Alias for backward compatibility if needed, using "rooms" to store active/known rooms
  // "availableRooms" could be the list of ALL public rooms fetched from server.
  // For this refactor, let's keep "rooms" as the set of rooms we know about/have joined.



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
      this.typingUsers.delete(uid);
    }
  }

  setRooms(rooms: Room[]) {
    this.rooms.clear();
    rooms.forEach(room => this.rooms.set(room.uid, room));
    
    // Ensure activeChat is valid or reset to global if it exists
    if (!this.rooms.has(this.activeChat?.uid) && this.activeChat?.uid === 'global') {
        // if global is missing for some reason, we might want to re-add it or wait
    }
  }

  addRoom(room: Room) {
    this.rooms.set(room.uid, room);
  }

  updateRoom(room: Room) {
      if (this.rooms.has(room.uid)) {
          this.rooms.set(room.uid, room);
          // If active chat usage relies on room object, it should be reactive if we used the object from map.
          // But activeChat is a separate reference.
          if (this.activeChat?.uid === room.uid) {
              this.activeChat = room;
          }
      }
  }

  removeRoom(roomId: string) {
      this.rooms.delete(roomId);
      if (this.activeChat?.uid === roomId) {
          // Switch to global or empty
          const global = this.rooms.get('global');
          if (global) this.activeChat = global;
      }
  }

  // --- Business Logic ---
  typingTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

  handleTyping() {
    if (!this.activeChat?.uid || this.activeChat.uid === "global" || !this.currentUser) return;

    const socket = getSocket();
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    // Send "start typing"
    socket.send(
      JSON.stringify({
        type: "typing",
        isTyping: true,
        senderId: this.currentUser.uid,
        recipientId: this.activeChat.uid,
      })
    );

    // Clear existing timeout
    if (this.typingTimeout) clearTimeout(this.typingTimeout);

    // Set new timeout to stop typing
    this.typingTimeout = setTimeout(() => {
      if (socket && socket.readyState === WebSocket.OPEN && this.currentUser && this.activeChat) {
        socket.send(
          JSON.stringify({
            type: "typing",
            isTyping: false,
            senderId: this.currentUser.uid,
            recipientId: this.activeChat.uid,
          })
        );
      }
    }, 2000);
  }

  sendMessage(text: string) {
    // Pre-validation checks
    const trimmedMessage = text.trim();
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

    if (!this.activeChat?.uid || !this.currentUser) {
      console.error("No active chat or user");
      return;
    }

    // Create message
    const msg: Message = {
      id: crypto.randomUUID(),
      type: "message",
      kind: "chat",
      text: trimmedMessage,
      senderId: this.currentUser.uid,
      senderName: this.currentUser.username,
      // Logic for Room vs DM
      recipientId: this.rooms.has(this.activeChat.uid) ? undefined : this.activeChat.uid,
      roomId: this.rooms.has(this.activeChat.uid) ? this.activeChat.uid : undefined,
      timestamp: Date.now(),
      status: "sent",
    };

    // Schema validation
    const validateMessage = messageSchema.safeParse(msg);
    if (!validateMessage.success) {
      console.error("Validation error:", validateMessage.error);
      return;
    }

    const validMessage = validateMessage.data;

    // Optimistic UI update
    const currentList = this.messages.get(this.activeChat.uid) || [];
    this.messages.set(this.activeChat.uid, [...currentList, validMessage]);

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
      const rolledBackList = (this.messages.get(this.activeChat.uid) || []).filter(
        (m) => m.id !== validMessage.id
      );
      this.messages.set(this.activeChat.uid, rolledBackList);
    }
  }
}

export const chatStore = new ChatStore();
