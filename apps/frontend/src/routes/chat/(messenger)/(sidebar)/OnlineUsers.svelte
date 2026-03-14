<script lang="ts">
  import { chatStore } from "$lib/stores/store.svelte.js";
  import { userStore } from "$lib/stores/userStore.svelte";
  import type { User } from "@pingxy/shared/domain/user/user.types";
  import GenderIcon from "../GenderIcon.svelte";

  let { searchQuery, gender } = $props();

  // $inspect("#cache users:: ", userStore.getOnlineUsers());

  let sortedUsers = $derived.by(() => {
    const searchLower = searchQuery.trim().toLowerCase();
    return userStore
      .getOnlineUsers()
      .filter((data) => {
        if (gender !== "all" && data.gender !== gender) return false;
        if (searchLower && !data.username.toLowerCase().includes(searchLower))
          return false;
        return true;
      })
      .sort((a, b) => a.country.localeCompare(b.country));
  });

  // let sortedUsers = $derived.by(() => {
  //   const searchLower = searchQuery.trim().toLowerCase();
  //   return chatStore.visibleOnlineUsers
  //     .filter((data) => {
  //       if (gender !== "all" && data.gender !== gender) return false;
  //       if (searchLower && !data.username.toLowerCase().includes(searchLower))
  //         return false;
  //       return true;
  //     })
  //     .sort((a, b) => a.country.localeCompare(b.country));
  // });

  function handleClick(user: User) {
    // chatStore.target = { isUser: true, user: user };
    // chatStore.initChat(user);

    chatStore.chatTarget = {
      isUser: true,
      type: "direct",
      displayName: user.username,
      partner: {
        id: user.id,
        username: user.username,
        gender: user.gender,
        age: user.age,
        country: user.country,
      },
    };
  }
</script>

<!-- USERS -->
<div class="bg-white flex flex-col overflow-hidden">
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
    <a
      href="/chat/u_{user.id}"
      class="px-2 py-1 hover:bg-gray-300 relative flex w-full gap-1 border-gray-200 justify-between"
      id={user.id.toString()}
      onclick={() => handleClick(user)}
    >
      <div class="flex items-center gap-2">
        <GenderIcon gender={user.gender} />
        <span class="truncate">
          {#if user.id === chatStore.currentUser?.id}
            You
          {:else}
            {user.username}
          {/if}
        </span>
      </div>
      {#if user.country && user.country !== "0"}
        <span
          class="font-bold ml-auto text-xs shrink-0 flex items-center gap-1"
        >
          {user.country}
          <span class={`fi fi-${user.country.toLocaleLowerCase()}`}> </span>
        </span>
      {/if}
    </a>
  </li>
{/snippet}
