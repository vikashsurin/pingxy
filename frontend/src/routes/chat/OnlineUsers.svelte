<script lang="ts">
  import type { User } from "../../../../shared/src";
  import GenderIcon from "$lib/components/GenderIcon.svelte";
  import {
    activeChat,
    recentChats,
    unread,
    searchQuery,
  } from "$lib/store.svelte.js";
  import {
    ChevronDown,
    ChevronUp,
    Dot,
    MessageSquare,
    MessageSquareDot,
  } from "@lucide/svelte";
  import SidebarHeader from "$lib/components/SidebarHeader.svelte";

  let { user: me, users } = $props();

  let activeChatUser = activeChat.value;
  let isExpandedRecentChats = $state(false);
  let filterGender = $state("all");
  let usersCount = $derived.by(() => {
    return users.size - 1;
  });

  let sortedUsers = $derived.by(() => {
    if (!users || users.size === 0) return [];

    // Optimization 1: Move heavy ID mapping outside the filter loop
    const recentChatIds = new Set(recentChats.value.map((usr) => usr.uid));
    const searchLower = searchQuery.value.trim().toLowerCase();

    return (
      Array.from<User>(users.values())
        .filter((usr) => {
          if (recentChatIds.has(usr.uid)) return false;
          if (filterGender !== "all" && usr.gender !== filterGender)
            return false;
          if (searchLower && !usr.username.toLowerCase().includes(searchLower))
            return false;
          return true;
        })

        // Optimization 2: Use .sort() on the new filtered array
        .sort((a, b) => a.country.localeCompare(b.country))
    );
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
          class="flex w-full text-sm items-center bg-gray-300 hover:bg-gray-400 justify-between py-2 px-3"
          title="Toggle Recent Chats"
          onclick={() => (isExpandedRecentChats = !isExpandedRecentChats)}
        >
          <div class="flex items-center gap-2">
            <MessageSquare size={14} />
            <span>Recent Chats</span>
            {#if unread.size > 0}
              <Dot class="animate-bounce text-blue-600" />
            {/if}
          </div>
          {#if isExpandedRecentChats}
            <ChevronUp size={24} class="p-1" />
          {:else}
            <ChevronDown size={24} class="p-1" />
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
      <!-- Online Users Count -->
      <div>
        <span class="text-sm font-medium text-gray-400 px-3"
          >Online {usersCount > 0 ? `(${usersCount})` : ""}</span
        >
      </div>
      {#each sortedUsers as user (user.uid)}
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

        <!-- COUNTRY -->
        {#if user.country === "0"}
          <span></span>
        {:else}
          <span class="font-bold ml-auto text-xs">
            {user.country}
            <span class={`fi fi-${user.country.toLocaleLowerCase()}`}> </span>
          </span>
        {/if}
        {@render unreaStatus(user.uid!)}
      </div>
    </button>
  </li>
{/snippet}

{#snippet unreaStatus(uid: string)}
  {#if unread.has(uid!)}
    <Dot class="text-blue-600" />
  {:else}
    <Dot class="text-blue-600 opacity-0" />
  {/if}
{/snippet}
