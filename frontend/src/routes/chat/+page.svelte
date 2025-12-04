<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Message, User } from "../../../../shared/types.js";

  import { initSocket, getSocket } from "$lib/socket.svelte.js";
  import { users, unread, messages, activeSocket } from "$lib/store.svelte.js";

  let socket: WebSocket | null = null;

  let { data } = $props();
  let message = $state("");
  let username = $derived(data.username);

  onMount(() => {
    data.users.forEach((user: User) => {
      users.set(user.uid as string, {
        uid: user.uid,
        username: user.username,
      });
    });
  });

  const activeMessages = $derived<Message[] | undefined>(
    messages.get(activeSocket?.uid!)
  );

  onMount(() => {
    initSocket();
    socket = getSocket();
  });

  onDestroy(() => {
    if (socket) {
      socket.close();
    }
  });

  function handleSend() {
    const msg: Message = {
      type: "message",
      kind: "chat",
      text: message,
      senderId: data.uid,
      senderName: data.username,
      recipientId: activeSocket?.uid!,
      timestamp: Date.now(),
    };

    messages.set(activeSocket?.uid!, [
      ...(messages.get(activeSocket?.uid!) || []),
      msg,
    ]);

    if (!socket) return;
    socket.send(JSON.stringify(msg));
    message = "";
  }

  function setactiveSocket(user: User | null) {
    if (!user) return;
    activeSocket.uid = user.uid;
    activeSocket.username = user.username;

    // reset unread
    unread.delete(user.uid!);
  }
</script>

<div class=" flex justify-between items-center">
  <h1 class="p-2">
    Logged in as
    <span class="text-green-600 font-bold">
      {username}
    </span>
  </h1>

  <a
    href="/chat/logout"
    data-sveltekit-preload-data={false}
    class="bg-red-400 p-2">Logout</a
  >
</div>

<div class=" grid grid-cols-2 gap-4 p-4">
  <div>
    <form action="" class="grid gap-2">
      <input
        type="text"
        placeholder="message"
        bind:value={message}
        class="w-full border p-2"
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

    <!-- TOPIC  -->
    {#if activeSocket?.uid === "global"}
      <h2 class="font-bold">Global chat</h2>
    {:else}
      <h2>
        Private chat with
        <span class="font-bold">
          {activeSocket?.username}
        </span>
      </h2>
    {/if}

    <!-- MESSAGES -->
    <ul>
      {#each activeMessages as message}
        <li>
          {#if message.senderName}
            <span class="inline-block font-medium mr-2"
              >{message.senderName} :
            </span>
          {/if}

          {#if message.kind === "system"}
            <span class="inline-block font-medium mr-2 bg-amber-300">
              {message.text}</span
            >
          {:else if message.kind === "chat"}
            <span>{message.text}</span>
          {/if}
        </li>
      {/each}
    </ul>
  </div>

  <!-- USERS -->
  <div>
    <h2 class="font-bold">Users</h2>
    <ul>
      {#each users as [key, value]}
        <li>
          <button
            class="px-2 py-0.5 rounded relative flex gap-1 border-gray-200"
            id={value.uid}
            style={activeSocket?.uid === value.uid
              ? "background-color: green; color: white;"
              : ""}
            onclick={(e) => setactiveSocket(value)}
          >
            {#if value.uid === data.uid}
              You
            {:else}
              {#if unread.has(value.uid!)}
                <div
                  class=" w-1.5 h-1.5 rounded-full bg-green-500 absolute left-0"
                ></div>
              {/if}
              {value.username}
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  </div>
</div>
