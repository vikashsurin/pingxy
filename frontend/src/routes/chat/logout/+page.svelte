<script lang="ts">
  import { onMount } from "svelte";
  import { chatStore } from "$lib/store.svelte";
  onMount(() => {
    chatStore.reset();
    if (sessionStorage) {
      sessionStorage.removeItem("chat");
    }
  });
</script>

<h1>Logging out..</h1>
