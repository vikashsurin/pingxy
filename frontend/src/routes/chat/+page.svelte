<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type {
    Message,
    User,
  } from "../../../../shared/src/lib/utils/validation.js";

  import { initSocket, getSocket } from "$lib/socket.svelte.js";
  import { chatStore } from "$lib/store.svelte.js";
  import OnlineUsers from "./OnlineUsers.svelte";
  import Messages from "./ChatMessages.svelte";
  import ChatInput from "./ChatInput.svelte";
  import { browser } from "$app/environment";
  import ChatboxHeader from "$lib/components/ChatboxHeader.svelte";

  let socket: WebSocket | null = null;

  let { data } = $props();
  let tab = $state(1); // for mobile screen

  $effect.pre(() => {
    // load users
    chatStore.currentUser = data.user;
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
  </div>
  {#if tab === 0}
    <OnlineUsers user={data.user} users={chatStore.users} />
  {:else if tab === 1}
    <!-- Chatting with -->
    <ChatboxHeader user={data.user} />
    <div class="flex h-screen flex-col overflow-hidden">
      <!-- CHAT MESSAGES -->
      {#key chatStore.activeChat?.uid}
        <Messages user={data.user} {activeMessages} />
      {/key}

      <!-- MESSAGE INPUT BOX -->
      <ChatInput />
    </div>
  {:else if tab === 2}
    {#key chatStore.activeChat?.uid}
      <Messages user={data.user} {activeMessages} />
    {/key}
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
      {#key chatStore.activeChat?.uid}
        <Messages user={data.user} {activeMessages} />
      {/key}

      <!-- MESSAGE INPUT BOX -->
      <ChatInput />
    </div>

    <!-- ADS SECTION -->
    <div class="w-80 bg-gray-100">ADS</div>
  </div>
</div>
