<script lang="ts">
  import { onMount } from "svelte";

  onMount(() => {
    if (sessionStorage) {
      sessionStorage.removeItem("chat");
    }
  });
</script>

<h1>Logging out..</h1>
