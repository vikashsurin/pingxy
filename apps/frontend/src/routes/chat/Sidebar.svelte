<script lang="ts">
  import { chatStore } from "$lib/store/store.svelte";
  import { MessageCircleWarning } from "@lucide/svelte";
  import OnlineUsers from "./OnlineUsers.svelte";
  import RecentChats from "./RecentChats.svelte";
  import SidebarFilter from "./SidebarFilter.svelte";

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
      class="justify-center flex w-full items-center gap-2 hover:bg-amber-400 {!showUsers
        ? 'bg-amber-400'
        : ''}"
      onclick={() => (showUsers = false)}
    >
      Chats
      {#if chatStore.hasUnreadMessages}
        <div
          class="bg-red-600 w-5 h-5 flex items-center justify-center rounded-full text-white border border-red-800 text-xs"
        >
          {chatStore.totalUnreadCount}
        </div>
      {/if}
    </button>
  </div>

  {#if showUsers}
    <OnlineUsers {searchQuery} {gender} bind:showUsers />
  {:else}
    <RecentChats bind:showUsers />
  {/if}
</div>
