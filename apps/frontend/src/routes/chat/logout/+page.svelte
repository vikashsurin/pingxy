<script lang="ts">
  import { onMount } from "svelte";
  import { chatStore } from "$lib/store.svelte";
  import { getSocket } from "$lib/socket.svelte";
  import type { MessagePayload } from "@chat/shared/src/lib/utils/validation";
  // onMount(() => {
  //   chatStore.reset();
  //   if (sessionStorage) {
  //     sessionStorage.removeItem("chat");
  //   }
  // });

  onMount(() => {});
</script>

<h1>Logging out..</h1>
