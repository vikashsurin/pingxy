<script lang="ts">
  import type { User } from "../../../../shared/src";
  import GenderIcon from "$lib/components/GenderIcon.svelte";
  import {
    activeChat,
    recentChats,
    unread,
    searchQuery,
  } from "$lib/store.svelte.js";
  import { ChevronDown, ChevronUp } from "@lucide/svelte";
  import SidebarHeader from "$lib/components/SidebarHeader.svelte";

  let { user: me, users } = $props();

  let activeChatUser = activeChat.value;
  let isExpandedRecentChats = $state(false);
  let filterGender = $state("all");

  $inspect({ s: searchQuery.value });

  const filteredUsers = $derived.by<User[]>(() => {
    console.log("filtering ");
    if (!users || users.size === 0) {
      return [];
    }

    const recentChatIds = new Set(recentChats.value.map((usr) => usr.uid));
    const usersArray: User[] = Array.from(users.values());
    const searchLower = searchQuery.value.trim().toLowerCase();

    return usersArray.filter((usr) => {
      // filter recent chats
      if (recentChatIds.has(usr.uid)) {
        return false;
      }

      // Filter by gender
      if (filterGender !== "all" && usr.gender !== filterGender) {
        return false;
      }

      // Filter by search query
      if (searchLower && !usr.username.toLowerCase().includes(searchLower)) {
        console.log("no match");
        return false;
      }
      return true;
    });
  });

  // const genderFilter
  function handleGenderFilter(e) {
    filterGender = e.target.value;
  }

  function handleClick(user: User) {
    if (!user) return;
    activeChat.value = user;

    // reset unread
    unread.delete(user.uid!);
  }
</script>

<!-- USERS -->
<div class="bg-gray-100 min-w-[300px] flex flex-col overflow-hidden">
  <div class="flex flex-col overflow-hidden flex-1">
    <!-- Filter, Search -->
    <SidebarHeader {handleGenderFilter} />
    <ul class="flex-1 overflow-y-auto">
      <div>
        <button
          class="flex w-full text-sm items-center bg-gray-300 hover:bg-gray-400 justify-between p-2"
          title="Toggle Recent Chats"
          onclick={() => (isExpandedRecentChats = !isExpandedRecentChats)}
        >
          <span>Recent Chats</span>
          {#if isExpandedRecentChats}
            <ChevronUp size={16} />
          {:else}
            <ChevronDown size={16} />
          {/if}
        </button>
        {#if isExpandedRecentChats}
          <div class="bg-amber-50">
            {#each recentChats.value as user (user.uid)}
              {@render onlineUser(user)}
            {/each}
          </div>
        {/if}
      </div>
      <!-- All users -->
      <div class="border border-gray-700 my-2"></div>
      {#each filteredUsers as user (user.uid)}
        {@render onlineUser(user)}
      {/each}
    </ul>
  </div>
</div>

<!-- SNIPPET -->
{#snippet onlineUser(user: User)}
  <li>
    <button
      class="px-2 py-0.5 w-full hover:bg-gray-300 relative flex gap-1 border-gray-200"
      id={user.uid}
      style={activeChatUser?.uid === user.uid
        ? "background-color: #1e1e1e; color: white;"
        : ""}
      onclick={(e) => handleClick(user)}
    >
      <div class="flex items-center gap-1 w-full">
        <GenderIcon gender={user.gender} />
        <span>
          {#if user.uid === me.uid}
            You
          {:else}
            {user.username}
          {/if}
        </span>

        <span class="font-bold ml-auto text-xs">
          {user.country}
          <span class={`fi fi-${user.country.toLocaleLowerCase()}`}> </span>
        </span>

        {@render unreaStatus(user.uid!)}
      </div>
    </button>
  </li>
{/snippet}

{#snippet unreaStatus(uid: string)}
  {#if unread.has(uid!)}
    <span class=" w-1.5 h-1.5 rounded-full bg-blue-500 flex ml-2 animate-pulse"
    ></span>
  {:else}
    <span class=" w-1.5 h-1.5 rounded-full flex ml-2"></span>
  {/if}
{/snippet}
