<script lang="ts">
    import Navbar from "./Navbar.svelte";
    import { chatStore } from "$lib/store/store.svelte";

    let { children, data } = $props();

    $effect(() => {
        chatStore.currentUser = data.user;
    });
</script>

<div class="h-dvh flex flex-col">
    <div class="banner">AD Display</div>

    {#if data.success && data.user}
        <Navbar username={data.user.username} />
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
