<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import Toaster from "$lib/components/toast/Toaster.svelte";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Pingxy</title>
</svelte:head>

{@render children()}
<Toaster />
