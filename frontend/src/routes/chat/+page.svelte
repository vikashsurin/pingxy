<script lang="ts">
  import { onMount } from "svelte";

  let { data } = $props();
  let username = $derived(data.username);

  let socket;

  onMount(() => {
    socket = new WebSocket("ws://localhost:3000/ws");
    socket.addEventListener("open", (event) => {
      console.log("connected");
    });
  });
</script>

<h1>
  Logged in as
  <span class="text-green-600 font-bold">
    {username}
  </span>
</h1>

<a href="/chat/logout" class="bg-red-400 p-2">Logout</a>
