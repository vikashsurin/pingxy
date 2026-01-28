<script lang="ts">
  import { onMount } from "svelte";
  import { PUBLIC_API_URL } from "$env/static/public";
  onMount(async () => {
    const response = await fetch(`/api/health`);
    const body = await response.json();

    console.log({ body });
  });

  onMount(() => {
    console.log({
      PUBLIC_API_URL,
    });
  });
</script>
