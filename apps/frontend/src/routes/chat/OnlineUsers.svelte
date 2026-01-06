<script lang="ts">
  import type { PublicUser, User } from "@chat/shared/src/lib/utils/validation";
  import { chatStore } from "$lib/store.svelte.js";
  import GenderIcon from "./GenderIcon.svelte";
  import { ChevronDown, ChevronUp, MessageSquare } from "@lucide/svelte";
  import SidebarHeader from "./SidebarHeader.svelte";
  import { getSocket } from "$lib/socket.svelte.js";
  import { onMount } from "svelte";

  let {} = $props();

  let isExpandedRecentChats = $state(false);
  let filterGender = $state("all");

  let usersCount = $derived.by(() => {
    return chatStore.onlineUsers.length - 1;
  });

  let sortedUsers = $derived.by(() => {
    const searchLower = chatStore.searchQuery.trim().toLowerCase();
    return chatStore.onlineUsers
      .filter((user) => {
        if (filterGender !== "all" && user.data.gender !== filterGender)
          return false;
        if (searchLower && !user.username.toLowerCase().includes(searchLower))
          return false;
        return true;
      })
      .sort((a, b) => a.data.country.localeCompare(b.data.country));
  });

  // const genderFilter
  function handleGenderFilter(e: Event & { target: HTMLInputElement }) {
    filterGender = e.target.value;
  }

  // async function loadMessagesFor(target: ChatTarget) {
  //   try {
  //     const response = await fetch(
  //       `http://localhost:3000/api/messages/history/${me.id}/${target.id}?limit=50`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         credentials: "include",
  //       }
  //     );
  //     const data = await response.json();
  //     if (!response.ok) {
  //       console.error(
  //         "Failed to load messages for ",
  //         target.username,
  //         data.message
  //       );
  //       return;
  //     }
  //     const reversedMessages = data.messages.reverse();
  //     chatStore.messages.set(target.id, reversedMessages);
  //   } catch (error) {
  //     console.error("Error loading messages for ", target.username, error);
  //     return;
  //   }
  // }

  // TODO Handle read receipts when opening a chat
  function initChat(user: PublicUser) {
    chatStore.chatTarget = user;

    // const socket = getSocket();
    // if (socket && socket.readyState === WebSocket.OPEN) {
    //   socket.send(
    //     JSON.stringify({
    //       type: "read_receipt",
    //       senderId: chatStore.currentUser?.id,
    //       recipientId: user.id,
    //     })
    //   );
    // }

    // loadMessagesFor(user);
  }
</script>

<!-- USERS -->
<div class="bg-gray-100 min-w-75 flex flex-col overflow-hidden">
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
            <!-- {#if chatStore.unread.size > 0}
              <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse"
              ></span>
            {/if} -->
          </div>
          {#if isExpandedRecentChats}
            <ChevronUp size={24} class="p-1" />
          {:else}
            <ChevronDown size={24} class="p-1" />
          {/if}
        </button>
        {#if isExpandedRecentChats}
          <!-- RECENT CHATS -->
          <div class="bg-amber-50">
            <!-- {#each chatStore.recentChats as target (target.id)}
              {@render userItemRow(target)}
            {/each} -->
          </div>
        {/if}
      </div>
      <!-- Separator -->
      <div class="border border-gray-700 my-2"></div>

      <!-- RENDER ONLINE USERS LIST -->
      {#each sortedUsers as user (user.id)}
        {@render userItemRow(user)}
      {/each}
    </ul>
  </div>
</div>

<!-- SNIPPETS-------------------------------- -->

{#snippet userItemRow(user: PublicUser)}
  <li>
    <div class="flex items-center gap-1 w-full relative group">
      <button
        class="px-2 py-1 w-full hover:bg-gray-300 relative flex gap-1 border-gray-200"
        id={user.id.toString()}
        onclick={(e) => initChat(user)}
      >
        <div class="flex items-center gap-2 w-full overflow-hidden">
          <GenderIcon gender={user.data.gender} />
          <span class="truncate">
            {#if user.id === chatStore.currentUser?.id}
              You
            {:else}
              {user.username}
            {/if}
          </span>

          {#if user.data.country && user.data.country !== "0"}
            <span
              class="font-bold ml-auto text-xs shrink-0 flex items-center gap-1"
            >
              {user.data.country}
              <span class={`fi fi-${user.data.country.toLocaleLowerCase()}`}>
              </span>
            </span>
          {/if}
        </div>

        <!-- {@render unreaStatus(user.id!)} -->
      </button>
    </div>
  </li>
{/snippet}

<!-- {#snippet unreaStatus(id: string)}
  {#if (chatStore.unread.get(id!) ?? 0) > 0}
    <span
      class="w-4 h-4 rounded-full bg-red-600 animate-pulse text-[10px] flex items-center justify-center text-white ml-auto"
    >
      {chatStore.unread.get(id!) ?? 0}
    </span>
  {/if}
{/snippet} -->
