<script lang="ts">
  import { chatStore } from "$lib/store/store.svelte.js";
  import type { User } from "@pingxy/shared/domain/user/user.types";
  import GenderIcon from "./GenderIcon.svelte";

  let { searchQuery, gender, showUsers = $bindable() } = $props();
  let sortedUsers = $derived.by(() => {
    const searchLower = searchQuery.trim().toLowerCase();
    return chatStore.visibleOnlineUsers
      .filter((data) => {
        if (gender !== "all" && data.data.gender !== gender) return false;
        if (searchLower && !data.username.toLowerCase().includes(searchLower))
          return false;
        return true;
      })
      .sort((a, b) => a.data.country.localeCompare(b.data.country));
  });

  function handleOpenConversation(user: User) {
    showUsers = false;
    chatStore.target = { isUser: true, user: user };
    chatStore.initChat(user);
  }
</script>

<!-- USERS -->
<div class="bg-white min-w-75 flex flex-col overflow-hidden">
  <div class="flex flex-col overflow-hidden flex-1">
    <ul class="flex-1 overflow-y-auto">
      {#each sortedUsers as user}
        {@render userItemRow(user)}
      {/each}
    </ul>
  </div>
</div>

<!-- SNIPPETS-------------------------------- -->

{#snippet userItemRow(user: User)}
  <li>
    <div class="flex items-center gap-1 w-full relative group">
      <button
        class="px-2 py-1 w-full hover:bg-gray-300 relative flex gap-1 border-gray-200"
        id={user.id.toString()}
        onclick={() => handleOpenConversation(user)}
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
