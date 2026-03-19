<script lang="ts">
  import { socket } from "$lib/socket/socket.svelte";
  import { Loader } from "@lucide/svelte";
  let { data } = $props();

  $effect(() => {
    socket?.close();
    if (data.success) {
      window.location.href = "/login";
    }
  });
</script>

<div class="flex flex-col items-center">
  <Loader size={24} class="animate-spin" />
  Logging out...
</div>
