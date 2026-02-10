<script lang="ts">
  import { chatStore } from "$lib/store/store.svelte";
  import OnlineUsers from "./OnlineUsers.svelte";
  import RecentChats from "./RecentChats.svelte";
  import SidebarFilter from "./SidebarFilter.svelte";

  let searchQuery = $state("");
  let gender = $state("all");
  let showUsers = $state(true);

  //   const hasUnreadMessages = $derived.by(() => {
  //     return Object.values(chatStore.conversations).forEach((conversation) => {
  //       if (conversation.unreadCount && conversation.unreadCount > 0) return true;
  //     });
  //   });

  $inspect({ hasUnreadMessages: chatStore.hasUnreadMessages });
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
      <!-- {#if chatStore.conversations } -->
    </button>
  </div>

  {#if showUsers}
    <OnlineUsers {searchQuery} {gender} />
  {:else}
    <RecentChats />
  {/if}
</div>
