<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Message, User } from "../../../../shared/src/types.js";

  import { initSocket, getSocket } from "$lib/socket.svelte.js";
  import { users, unread, messages, activeSocket } from "$lib/store.svelte.js";
  import Users from "./Users.svelte";
  import Messages from "./Messages.svelte";
  import { messageSchema } from "../../../../shared/src/validation.js";

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

    //validation
    const validateMessage = messageSchema.safeParse(msg);

    if (!validateMessage.success) {
      console.error("validation error", validateMessage.error);
      return;
    }

    const validMessage = validateMessage.data;

    messages.set(activeSocket?.uid!, [
      ...(messages.get(activeSocket?.uid!) || []),
      validMessage,
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

<div class="  gap-4 p-4">
  <div class="grid grid-cols-[6fr_1fr]">
    <!-- TOPIC  -->
    <div>
      <div class="bg-gray-200 py-2 px-3">
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
      </div>

      <!-- chat messages -->
      <Messages {activeMessages} />
    </div>

    <Users
      user={{ uid: data.uid, username: data.username }}
      {users}
      {unread}
      {activeSocket}
      {setactiveSocket}
    />
  </div>

  <!-- chat message form -->
  <div class="bg-gray-400 absolute bottom-4">
    <form action="" class="flex gap-2 bg-white">
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
  </div>
</div>
