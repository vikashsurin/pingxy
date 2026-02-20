<script lang="ts">
  import { chatStore } from "$lib/store/store.svelte";
  import { MessageSquare, MessagesSquare, Users } from "@lucide/svelte";
  import OnlineUsers from "./OnlineUsers.svelte";
  import RecentChats from "./RecentChats.svelte";
  import SidebarFilter from "./SidebarFilter.svelte";
  let searchQuery = $state("");
  let gender = $state("all");
  let showUsers = $state(true);
  let showGroups = $state(false);

  let tabs = [
    {
      id: 1,
      name: "Users",
      icon: Users,
      value: "users",
    },
    {
      id: 2,
      name: "Groups",
      icon: MessagesSquare,
      value: "groups",
    },
    {
      id: 3,
      name: "Chats",
      icon: MessageSquare,
      value: "chats",
    },
  ];
</script>

<div class="col-span-2 border-5 border-purple-500">
  <SidebarFilter bind:gender bind:searchQuery />
  <!-- TODO: complete the sidebar with online users and recent chats, also add the filter -->

  <div class="w-full flex justify-between">
    {#each tabs as tab}
      <button
        class="flex items-center justify-center w-full bg-gray-200 {tab.value ===
          'users' && showUsers
          ? 'bg-white text-sky-600'
          : ''} {tab.value === 'groups' && showGroups
          ? 'bg-white text-sky-600'
          : ''} {tab.value === 'chats' && !showUsers
          ? 'bg-white text-sky-600'
          : ''}"
        onclick={() => {
          if (tab.value === "users") {
            showUsers = true;
            showGroups = false;
          } else if (tab.value === "groups") {
            showGroups = !showGroups;
            showUsers = false;
          } else if (tab.value === "chats") {
            showUsers = false;
            showGroups = false;
          }
        }}
      >
        <tab.icon size={16} strokeWidth={3} />
        {#if tab.value === "chats" && chatStore.hasUnreadMessages}
          <div
            class="bg-red-600 w-5 h-5 flex items-center justify-center rounded-full text-white border border-red-800 text-xs"
          >
            {chatStore.totalUnreadCount}
          </div>
        {/if}
      </button>
    {/each}
    <!-- <button
      class="flex items-center justify-center w-full bg-gray-200 {showUsers
        ? 'bg-white text-sky-600'
        : ''}"
      onclick={() => (showUsers = true)}
    >
      <Users size={16} strokeWidth={3} />
    </button>
    <button
      class="flex items-center justify-center w-full bg-gray-200 {showGroups
        ? 'bg-white text-sky-600'
        : ''}"
      onclick={() => (showGroups = !showGroups)}
    >
      <MessagesSquare size={16} strokeWidth={3} />
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
    </button> -->
  </div>

  {#if showUsers}
    <OnlineUsers {searchQuery} {gender} bind:showUsers />
  {:else}
    <RecentChats bind:showUsers />
  {/if}
</div>
