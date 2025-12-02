<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Connection, Message, User } from "../../../../shared/types.js";
  import { SvelteMap } from "svelte/reactivity";

  let { data } = $props();
  let notification = $state("");
  let message = $state("");
  let username = $derived(data.username);

  let usersMap = new SvelteMap<string, User>(data.users);
  let users = $derived(Array.from(usersMap.values()));

  let messages = new SvelteMap<string, Message[]>();

  let activeSocket = $state<User>({
    uid: "global",
    username: "global",
  });

  const activeMessages = $derived<Message[] | undefined>(
    messages.get(activeSocket?.uid!)
  );

  $inspect({ users });

  let socket = null;

  onMount(() => {
    socket = new WebSocket("ws://localhost:3000/ws");

    socket.addEventListener("open", (event) => {
      console.log("connected");
    });

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "connection") {
        const c: Connection = data;
        console.log({ c: c.text });
        if (c.status === "reconnect") return;

        if (c.status === "join") {
          const user: User = {
            uid: c.uid,
            username: c.username,
          };
          notification = c.text!;
          usersMap.set(user.uid!, user);
        }
        if (c.status === "leave") {
          const user: User = {
            uid: c.uid,
            username: c.username,
          };
          notification = c.text!;
          usersMap.delete(user.uid!);
        }
        return;
      }

      // console.log({ out: data });
      if (data.type === "message") {
        const message: Message = data;
        // console.log({ message });

        if (message.recipientId === "global") {
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
    activeSocket = user;
  }
</script>

<div class=" flex justify-between items-center">
  <h1 class="p-2">
    Logged in as
    <span class="text-green-600 font-bold">
      {username}
    </span>
  </h1>

  <a href="/chat/logout" class="bg-red-400 p-2">Logout</a>
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
      {#if users.length > 0}
        {#each users as user}
          <li>
            <button
              class="px-2 py-0.5"
              id={user.uid}
              style={activeSocket?.uid === user.uid
                ? "background-color: green; color: white;"
                : ""}
              onclick={(e) => setactiveSocket(user)}
            >
              {#if user.uid === data.uid}
                You
              {:else}
                {user.username}
              {/if}
            </button>
          </li>
        {/each}
      {:else}
        <li>no users</li>
      {/if}
    </ul>
  </div>
</div>
