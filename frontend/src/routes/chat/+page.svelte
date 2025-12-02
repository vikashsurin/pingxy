<script lang="ts">
  import { json } from "@sveltejs/kit";
  import { onDestroy, onMount } from "svelte";
  import type { Message, User } from "../../../../shared/types.js";
  import { SvelteMap } from "svelte/reactivity";

  let { data } = $props();
  let message = $state("");
  let username = $derived(data.username);
  let users = $derived<User[]>(data.users);

  let activePartner = $state<User | null>({
    uid: null,
    username: null,
  });

  let messages = $state<Message[]>([]);

  let tempMap = new SvelteMap<string, Message[]>();

  $inspect({ messages });

  let socket = null;

  onMount(() => {
    socket = new WebSocket("ws://localhost:3000/ws");

    socket.addEventListener("open", (event) => {
      console.log("connected");
    });

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      const message = data.message as Message;
      messages.push(data.message);

      tempMap.set(message?.senderId!, [
        ...(tempMap.get(message?.senderId!) || []),
        message,
      ]);

      console.log("done");
    });

    socket.addEventListener("close", (event) => {
      console.log("disconnected");
    });
  });

  onDestroy(() => {
    if (socket) {
      socket.close();
    }
  });

  function handleSend() {
    const msg: Message = {
      type: "message",
      text: message,
      senderId: data.uid,
      senderName: data.username,
      timestamp: Date.now(),
    };
    messages.push(msg);
    socket.send(JSON.stringify(msg));
    message = "";
  }

  $inspect({ activePartner });
  function setActivePartner(user: User | null) {
    activePartner = user;
  }
</script>

<div class=" flex justify-between items-center">
  <h1 class="p-2">
    Logged in as
    <span class="text-green-600 font-bold">
      {username}
    </span>
  </h1>

  <a href="/logout" class="bg-red-400 p-2">Logout</a>
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
    {#if activePartner !== null}
      <h2>
        Private chat with
        <span class="font-bold">
          {activePartner?.username}
        </span>
      </h2>
    {:else}
      <h2 class="font-bold">Global chat</h2>
    {/if}

    <!-- MESSAGES -->
    <ul>
      {#each messages as message}
        <li>
          {#if message.senderName}
            <span class="inline-block font-medium mr-2"
              >{message.senderName} :
            </span>
          {/if}
          <span>{message.text}</span>
        </li>
      {/each}
    </ul>
  </div>

  <!-- USERS -->
  <div>
    <h2 class="font-bold">Users</h2>
    <ul>
      <li>
        <button onclick={(e) => setActivePartner(null)}> Global </button>
      </li>
      {#each users as user}
        <li>
          <button id={user.uid} onclick={(e) => setActivePartner(user)}>
            {user.username}
          </button>
        </li>
      {/each}
    </ul>
  </div>
</div>
