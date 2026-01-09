<script lang="ts">
    import type { EnumType } from "typescript";
    import OnlineUsers from "./OnlineUsers.svelte";
    import SidebarFilter from "./SidebarFilter.svelte";
    import RecentChats from "./RecentChats.svelte";

    let searchQuery = $state("");
    let gender = $state("all");
    let showUsers = $state(true);
</script>

<div class="">
    <SidebarFilter bind:gender bind:searchQuery />

    <div class="w-full flex justify-between">
        <button
            class="justify-center w-full hover:bg-amber-400 {showUsers
                ? 'bg-amber-400'
                : ''}"
            onclick={() => (showUsers = true)}
        >
            Users
        </button>

        <button
            class="justify-center w-full hover:bg-amber-400 {!showUsers
                ? 'bg-amber-400'
                : ''}"
            onclick={() => (showUsers = false)}
        >
            Chats
        </button>
    </div>

    {#if showUsers}
        <OnlineUsers {searchQuery} {gender} />
    {:else}
        <RecentChats />
    {/if}
</div>
