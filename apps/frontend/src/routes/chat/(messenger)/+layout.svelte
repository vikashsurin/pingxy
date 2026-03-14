<script lang="ts">
  import { initSocket } from "$lib/socket/socket.svelte";
  import { messageStore } from "$lib/stores/messageStore.svelte.js";
  import { onMount } from "svelte";
  import Sidebar from "./(sidebar)/Sidebar.svelte";
  import { conversationStore } from "$lib/stores/conversationStore.svelte.js";
  let { children, data } = $props();

  $effect.pre(() => {
    messageStore.initThreads(data.conversations);
    conversationStore.buildConversationMap(data.conversationData);
  });

  onMount(async () => {
    initSocket();
  });
</script>

<div class="grid grid-cols-12 flex-1 border-5 min-h-0 h-full">
  <Sidebar />
  <div class="col-span-9 border-5 border-green-500 h-full overflow-hidden">
    {@render children()}
  </div>
</div>
