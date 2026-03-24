<script lang="ts">
  import { uxManager } from "$lib/managers/entities/ux.svelte.js";
  import { socket } from "$lib/socket/socket.svelte";
  import { Loader } from "@lucide/svelte";
  let { data } = $props();

  $effect(() => {
    socket?.close();
    uxManager.stopHeartBeat();
    if (data.success) {
      window.location.href = "/login";
    }
  });
</script>

<div class="flex flex-col items-center">
  <Loader size={24} class="animate-spin" />
  Logging out...
</div>
