<script lang="ts">
  import Navbar from "./Navbar.svelte";
  import { chatStore } from "$lib/store.svelte.js";

  let { children, data } = $props();

  $effect.pre(() => {
    chatStore.currentUser = data.user;
  });


  let username = $derived(data?.user?.username);
</script>

<div class="h-dvh flex flex-col">
  <div class="banner">AD Display</div>  

  <Navbar {username} />
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
