<script lang="ts">
  import Navbar from "./Navbar.svelte";
  import { chatStore } from "$lib/stores/store.svelte.js";
  import { initSocket } from "$lib/socket/socket.svelte.js";
  import { uxManager } from "$lib/managers/entities/ux.svelte.js";

  let { children, data } = $props();

  $effect.pre(() => {
    chatStore.currentUser = data.user;
    initSocket();
    // uxManager.stopHeartBeat();
    // uxManager.emitHeartbeat();
  });
</script>

<div class="h-dvh flex flex-col">
  <!-- <div class="banner">AD Display</div> -->

  {#if data.user}
    <Navbar username={data.user.username} userId={data.user.id} />
  {/if}

  {@render children()}
</div>

<style>
  /* .banner {
    background-color: gray;
    height: 90px;
    color: white;
    text-align: center;
  } */
</style>
