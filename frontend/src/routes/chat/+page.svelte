<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    type Message,
    type User,
    messageSchema,
  } from "../../../../shared/src/index";

  import { initSocket, getSocket } from "$lib/socket.svelte.js";
  import { chatStore } from "$lib/store.svelte.js";
  import OnlineUsers from "./OnlineUsers.svelte";
  import Messages from "./ChatMessages.svelte";
  import { browser } from "$app/environment";
  import ChatboxHeader from "$lib/components/ChatboxHeader.svelte";

  let socket: WebSocket | null = null;

  let { data } = $props();
  let message = $state("");
  let tab = $state(1); // for mobile screen

  $effect.pre(() => {
    // load users
    data.users.forEach((user: User) => {
      chatStore.users.set(user.uid as string, user);
    });
  });

  $effect.pre(() => {
    // load messages from session storage
    const raw = sessionStorage.getItem("chat");
    if (!raw) return;

    const data: Record<string, Message[]> = JSON.parse(raw);

    Object.entries(data).forEach(([key, value]) => {
      chatStore.messages.set(key, value);
    });
  });

  $effect(() => {
    const data = Object.fromEntries(chatStore.messages);

    if (sessionStorage !== undefined) {
      sessionStorage.setItem("chat", JSON.stringify(data));
    }
  });

  const activeMessages = $derived<Message[] | undefined>(
    chatStore.messages.get(chatStore.activeChat?.uid!),
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

    if (!chatStore.activeChat?.uid) {
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
      recipientId: chatStore.activeChat.uid,
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
    chatStore.messages.set(chatStore.activeChat.uid, [
      ...(chatStore.messages.get(chatStore.activeChat.uid) || []),
      validMessage,
    ]);
    message = ""; // Clear input immediately for better UX

    // If sending to self, ignore socket send and rollback
    if (validMessage.senderId === validMessage.recipientId) {
      return;
    }

    // Send with error handling
    try {
      socket.send(JSON.stringify(validMessage));
    } catch (error) {
      console.error("Send failed:", error);
      // toast.error("Failed to send message");

      // Rollback on failure
      const currentMessages =
        chatStore.messages.get(chatStore.activeChat.uid) || [];
      chatStore.messages.set(
        chatStore.activeChat.uid,
        currentMessages.filter((m) => m.id !== validMessage.id),
      );

      message = trimmedMessage; // Restore message to input
    }
  }
</script>

<!-- FOR SMALL SCREEN -->
<div
  class="flex lg:hidden flex-col h-full border-3 border-red-500 overflow-hidden"
>
  <!-- TAB GROUP -->
  <div class="grid grid-cols-2 justify-between font-bold text-sm text-gray-400">
    <button
      onclick={() => (tab = 0)}
      class={` p-2 ${tab === 0 ? "text-blue-500 bg-gray-200" : "bg-gray-100"} `}
      >OnlineUsers</button
    >
    <button
      onclick={() => (tab = 1)}
      class={`p-2 ${tab === 1 ? "text-blue-500 bg-gray-200" : "bg-gray-100"} `}
      >Messages</button
    >
    <!-- <button
      onclick={() => (tab = 2)}
      class={`${tab === 2 ? "text-blue-500" : ""}`}>Recent</button
    > -->
  </div>
  {#if tab === 0}
    <OnlineUsers user={data.user} users={chatStore.users} />
  {:else if tab === 1}
    <!-- Chatting with -->
    <ChatboxHeader user={data.user} />
    <div class="flex h-screen flex-col overflow-hidden">
      <!-- CHAT MESSAGES -->
      <Messages user={data.user} {activeMessages} />

      <!-- MESSAGE INPUT BOX -->
      <form action="" class="flex gap-2 bg-white shrink-0 p-2">
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
  {:else if tab === 2}
    <Messages user={data.user} {activeMessages} />
  {/if}
</div>

<!-- FOR LARGE SCREEN -->
<div
  class=" flex-col h-full overflow-hidden lg:flex sm:hidden md:hidden hidden"
>
  <div
    class="grid lg:grid-cols-[auto_1fr_auto] md:grid-cols-[auto_3fr] sm:grid-cols-1 h-full gap-2"
  >
    <!-- ONLINE USERS -->
    <OnlineUsers user={data.user} users={chatStore.users} />

    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Chatting with -->
      <ChatboxHeader user={data.user} />

      <!-- CHAT MESSAGES -->
      <Messages user={data.user} {activeMessages} />

      <!-- MESSAGE INPUT BOX -->
      <form action="" class="flex gap-2 bg-white shrink-0 p-2">
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
