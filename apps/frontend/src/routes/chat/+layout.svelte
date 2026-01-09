<script lang="ts">
  import Navbar from "./Navbar.svelte";
  import { chatStore } from "$lib/store.svelte.js";
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { getSocket } from "$lib/socket.svelte.js";
  import type { MessagePayload } from "@chat/shared/src/lib/utils/validation.js";

  let { children, data } = $props();

  $effect(() => {
    chatStore.currentUser = data.user;
  });

  const user = $derived(chatStore.currentUser);
</script>

<div class="h-dvh flex flex-col">
  <div class="banner">AD Display</div>
  {#if user !== undefined || user !== null}
    <Navbar username={user?.username} />
  {/if}

  {@render children()}
</div>

<style>
  .banner {
    background-color: gray;
    height: 90px;
    color: white;
    text-align: center;
  }
</style>
