<script lang="ts">
  import { initSocket } from "$lib/socket/socket.svelte";

  import { onMount } from "svelte";

  import Sidebar from "./Sidebar.svelte";

  import Chatbox from "./Chatbox.svelte";

  import AdSidebar from "./AdSidebar.svelte";

  onMount(() => {
    initSocket();
  });
</script>

<div class="grid grid-cols-2 h-screen overflow-hidden">
  <!-- <div
  class="grid grid-cols-[300px_minmax(900px,1fr)_300px] h-screen overflow-hidden"
> -->
  <Sidebar />

  <Chatbox />

  <AdSidebar />
</div>
