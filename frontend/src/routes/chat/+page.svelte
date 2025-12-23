<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    type Message,
    type User,
    messageSchema,
  } from "../../../../shared/src/index";

  import { initSocket, getSocket } from "$lib/socket.svelte.js";
  import { users, unread, messages, activeSocket } from "$lib/store.svelte.js";
  import Users from "./Users.svelte";
  import Messages from "./Messages.svelte";
  import Navbar from "./Navbar.svelte";
  import { browser } from "$app/environment";

  let socket: WebSocket | null = null;

  let { data } = $props();
  let message = $state("");
  let username = $derived(data.user.username);

  $effect.pre(() => {
    // load users
    data.users.forEach((user: User) => {
      users.set(user.uid as string, user);
    });
  });

  $effect.pre(() => {
    // load messages from session storage
    const raw = sessionStorage.getItem("chat");
    if (!raw) return;

    const data: Record<string, Message[]> = JSON.parse(raw);

    Object.entries(data).forEach(([key, value]) => {
      messages.set(key, value);
    });
  });

  $effect(() => {
    const data = Object.fromEntries(messages);

    if (sessionStorage !== undefined) {
      sessionStorage.setItem("chat", JSON.stringify(data));
    }
  });

  const activeMessages = $derived<Message[] | undefined>(
    messages.get(activeSocket?.uid!)
  );

  onMount(() => {
    // initialize socket
    initSocket();
    socket = getSocket();
  });

  onDestroy(() => {
    console.log("destroy");
    if (socket) {
      socket.close();
    }
    if (browser) {
      sessionStorage.removeItem("chat");
    }
  });
  function handleSend() {
    // Pre-validation checks
    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    if (trimmedMessage.length > 5000) {
      // toast.error("Message too long (max 5000 characters)");
      return;
    }

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      // toast.error("Not connected. Please reconnect.");
      return;
    }

    if (!activeSocket?.uid) {
      // toast.error("No active chat selected");
      return;
    }

    // Create message
    const msg: Message = {
      id: crypto.randomUUID(),
      type: "message",
      kind: "chat",
      text: trimmedMessage,
      senderId: data.user.uid,
      senderName: data.user.username,
      recipientId: activeSocket.uid,
      timestamp: Date.now(),
    };

    // Schema validation
    const validateMessage = messageSchema.safeParse(msg);
    if (!validateMessage.success) {
      const firstError = validateMessage.error.issues[0]?.message;
      console.error("Validation error:", validateMessage.error);
      // toast.error(firstError || "Invalid message format");
      return;
    }

    const validMessage = validateMessage.data;

    // Optimistic UI update
    messages.set(activeSocket.uid, [
      ...(messages.get(activeSocket.uid) || []),
      validMessage,
    ]);

    message = ""; // Clear input immediately for better UX

    // Send with error handling
    try {
      socket.send(JSON.stringify(validMessage));
    } catch (error) {
      console.error("Send failed:", error);
      // toast.error("Failed to send message");

      // Rollback on failure
      const currentMessages = messages.get(activeSocket.uid) || [];
      messages.set(
        activeSocket.uid,
        currentMessages.filter((m) => m.id !== validMessage.id)
      );

      message = trimmedMessage; // Restore message to input
    }
  }

  function setactiveSocket(user: User | null) {
    if (!user) return;
    activeSocket.uid = user.uid;
    activeSocket.username = user.username;

    // reset unread
    unread.delete(user.uid!);
  }
</script>

<div class="flex flex-col h-full overflow-hidden">
  <div class=" grid grid-cols-[auto_1fr_auto] h-full gap-2 m-4">
    <!-- ONLINE USERS -->
    <Users user={data.user} {users} {unread} {activeSocket} {setactiveSocket} />

    <!-- MESSAGE LIST and FORM -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <Messages {activeMessages} {activeSocket} />

      <form action="" class="flex gap-2 bg-white mt-4 shrink-0 p-2">
        <input
          type="text"
          placeholder="message"
          bind:value={message}
          class="flex-1 outline p-2 focus:outline-1 focus:outline-blue-500"
          onkeypress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button class="bg-blue-500 text-white px-3 py-2" onclick={handleSend}
          >Send</button
        >
      </form>
    </div>

    <!-- ADS SECTION -->
    <div class="w-80 bg-gray-100">ADS</div>
  </div>
</div>
