<script lang="ts">
  import { chatStore } from "$lib/store/store.svelte";
  import { MessageCircleWarning } from "@lucide/svelte";
  import OnlineUsers from "./OnlineUsers.svelte";
  import RecentChats from "./RecentChats.svelte";
  import SidebarFilter from "./SidebarFilter.svelte";
  import { Users, MessageSquare } from "@lucide/svelte";
  let searchQuery = $state("");
  let gender = $state("all");
  let showUsers = $state(true);
</script>

<div class="">
  <SidebarFilter bind:gender bind:searchQuery />

  <div class="w-full flex justify-between">
    <button
      class="flex items-center justify-center w-full bg-gray-200 {showUsers
        ? 'bg-white text-sky-600'
        : ''}"
      onclick={() => (showUsers = true)}
    >
      <Users size={16} strokeWidth={3} />
    </button>

    <button
      class="justify-center flex w-full items-center gap-2 p-2 bg-gray-200 {!showUsers
        ? 'bg-white text-sky-600'
        : ''}"
      onclick={() => (showUsers = false)}
    >
      <MessageSquare size={16} strokeWidth={3} />
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
