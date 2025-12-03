<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Connection, Message, User } from "../../../../shared/types.js";
  import { SvelteMap, SvelteSet } from "svelte/reactivity";

  let { data } = $props();
  let notification = $state("");
  let message = $state("");
  let username = $derived(data.username);

  let users = new SvelteMap<string, User>(data.users);

  let unread = new SvelteSet<string>();

  let messages = new SvelteMap<string, Message[]>();

  let activeSocket = $state<User>({
    uid: "global",
    username: "global",
  });

  const activeMessages = $derived<Message[] | undefined>(
    messages.get(activeSocket?.uid!)
  );

  // $inspect({ unread });

  let socket = null;

  onMount(() => {
    socket = new WebSocket("ws://localhost:3000/ws");

    socket.addEventListener("open", (event) => {
      console.log("connected");
    });

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      // update user list
      if (data.type === "connection") {
        const c: Connection = data;
        console.log({ c: c.text });
        if (c.status === "reconnect") return;

        if (c.status === "leave") {
          const user: User = {
            uid: c.uid,
            username: c.username,
          };
          notification = c.text!;
          users.delete(user.uid!);
        }
        if (c.status === "join") {
          const user: User = {
            uid: c.uid,
            username: c.username,
          };
          notification = c.text!;
          users.set(user.uid!, user);
        }
        return;
      }

      // update messages
      if (data.type === "message") {
        const message: Message = data;
        const recipientId = message.recipientId!;
        const senderId = message.senderId!;

        if (activeSocket?.uid !== senderId) {
          unread.add(senderId);
        }

        if (recipientId === "global") {
          messages.set("global", [...(messages.get("global") || []), message]);
        } else {
          const senderId = message.senderId!;
          messages.set(senderId, [...(messages.get(senderId) || []), message]);
        }
      }
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
      recipientId: activeSocket?.uid!,
      timestamp: Date.now(),
    };

    messages.set(activeSocket?.uid!, [
      ...(messages.get(activeSocket?.uid!) || []),
      msg,
    ]);

    socket.send(JSON.stringify(msg));
    message = "";
  }

  function setactiveSocket(user: User | null) {
    if (!user) return;
    activeSocket = user;

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
      {#if notification}
        <li>
          <span>{notification}</span>
        </li>
      {/if}
      {#each activeMessages as message}
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
