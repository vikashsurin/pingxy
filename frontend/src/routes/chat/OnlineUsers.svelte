<script lang="ts">
  import type {
    User,
    ChatTarget,
  } from "../../../../shared/src/lib/utils/validation.js";
  import GenderIcon from "$lib/components/GenderIcon.svelte";
  import { chatStore } from "$lib/store.svelte.js";
  import { ChevronDown, ChevronUp, MessageSquare, Hash } from "@lucide/svelte";
  import SidebarHeader from "$lib/components/SidebarHeader.svelte";

  let { user: me, users } = $props();

  let isExpandedRecentChats = $state(false);
  let filterGender = $state("all");

  let usersCount = $derived.by(() => {
    return users.size - 1;
  });
  $inspect({ users });
  let sortedUsers = $derived.by(() => {
    if (!users || users.size === 0) return [];

    const searchLower = chatStore.searchQuery.value.trim().toLowerCase();

    return Array.from<User>(users.values())
      .filter((usr) => {
        if (chatStore.recentChatIds.has(usr.uid)) return false;
        if (filterGender !== "all" && usr.gender !== filterGender) return false;
        if (searchLower && !usr.username.toLowerCase().includes(searchLower))
          return false;
        return true;
      })
      .sort((a, b) => a.country.localeCompare(b.country));
  });
  // const genderFilter
  function handleGenderFilter(e: Event & { target: HTMLInputElement }) {
    filterGender = e.target.value;
  }

  function handleClick(target: ChatTarget) {
    if (!target) return;
    chatStore.activeChat = target;
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
            {#if chatStore.unread.size > 0}
              <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse"
              ></span>
            {/if}
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
            {#each chatStore.recentChats as target (target.uid)}
              {@render itemRow(target)}
            {/each}
          </div>
        {/if}
      </div>
      <!-- Separator -->
      <div class="border border-gray-700 my-2"></div>

      <!-- Online Users -->
      {#each sortedUsers as user (user.uid)}
        {@render itemRow(user)}
      {/each}
    </ul>
  </div>
</div>

<!-- ---------------------------SNIPPETS--------------------------------------------------- -->

{#snippet itemRow(target: ChatTarget)}
  {@const isRoom = "type" in target}
  <li>
    <div class="flex items-center gap-1 w-full relative group">
      <button
        class="px-2 py-1 w-full hover:bg-gray-300 relative flex gap-1 border-gray-200"
        id={target.uid}
        style={chatStore.activeChat?.uid === target.uid
          ? "background-color: #1e1e1e; color: white;"
          : ""}
        onclick={(e) => {
          handleClick(target);
        }}
      >
        <div class="flex items-center gap-2 w-full overflow-hidden">
          {#if isRoom}
            <div
              class=" p-0.5 rounded-xs flex items-center justify-center shrink-0 bg-gray-200 text-gray-700"
            >
              <Hash size={12} />
            </div>
            <span class="font-medium truncate">{target.name}</span>
          {:else}
            <GenderIcon gender={target.gender} />
            <span class="truncate">
              {#if target.uid === me.uid}
                You
              {:else}
                {target.username}
              {/if}
            </span>

            {#if target.country && target.country !== "0"}
              <span
                class="font-bold ml-auto text-xs shrink-0 flex items-center gap-1"
              >
                {target.country}
                <span class={`fi fi-${target.country.toLocaleLowerCase()}`}>
                </span>
              </span>
            {/if}
          {/if}

          {@render unreaStatus(target.uid!)}
        </div>
      </button>
    </div>
  </li>
{/snippet}

{#snippet unreaStatus(uid: string)}
  {#if (chatStore.unread.get(uid!) ?? 0) > 0}
    <span
      class="w-4 h-4 rounded-full bg-red-600 animate-pulse text-[10px] flex items-center justify-center text-white ml-auto"
    >
      {chatStore.unread.get(uid!) ?? 0}
    </span>
  {/if}
{/snippet}
