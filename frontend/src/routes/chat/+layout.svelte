<script lang="ts">
  import Navbar from "./Navbar.svelte";

  let { children, data } = $props();
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
