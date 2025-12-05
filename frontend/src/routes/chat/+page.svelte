<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Message, User } from "../../../../shared/src/validation.js";
  import { messageSchema } from "../../../../shared/src/validation.js";

  import { initSocket, getSocket } from "$lib/socket.svelte.js";
  import { users, unread, messages, activeSocket } from "$lib/store.svelte.js";
  import Users from "./Users.svelte";
  import Messages from "./Messages.svelte";
  import Navbar from "./Navbar.svelte";

  let socket: WebSocket | null = null;

  let { data } = $props();
  let message = $state("");
  let username = $derived(data.username);

  $effect.pre(() => {
    // load users
    data.users.forEach((user: User) => {
      users.set(user.uid as string, {
        uid: user.uid,
        username: user.username,
      });
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

<div class="flex h-dvh flex-col">
  <Navbar {username} />

  <div class="border flex h-dvh p-4 relative">
    <Messages {activeMessages} {activeSocket} />

    <Users
      user={{ uid: data.uid, username: data.username }}
      {users}
      {unread}
      {activeSocket}
      {setactiveSocket}
    />

    <!-- MESSAGE FORM -->
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
</div>
