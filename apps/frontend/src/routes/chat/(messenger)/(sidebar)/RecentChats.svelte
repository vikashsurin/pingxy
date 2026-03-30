<script lang="ts">
  import { page } from "$app/state";
  import type { ChatState } from "$lib/stores/conversationStore.svelte";
  import { conversationStore } from "$lib/stores/conversationStore.svelte";
  import { userStore } from "$lib/stores/userStore.svelte";
  import { CheckCheck } from "@lucide/svelte";
  import GenderIcon from "../GenderIcon.svelte";

  let activeCid = $derived(page.url.pathname.split("/").at(-1));

  $inspect({ recentChats: conversationStore.recentChats });

  function handleClick(
    state: ChatState | undefined,
    uid: number | undefined,
    cid: number,
  ) {
    if (state) {
      state.resetUnreadCount();
    }
  }
</script>

<div class="flex-1 flex flex-col overflow-hidden">
  <ul class=" overflow-y-auto w-full">
    {#each conversationStore.recentChats as c (c.id)}
      {@render thread(c)}
    {/each}
  </ul>
</div>

<!-- {#snippet userItemRowSkeleton()}
  <li>
    <div class="p-3 flex flex-col gap-2">
      <div class="bg-gray-300 h-6 w-1/2 rounded-xs animate-pulse"></div>
      <div class="bg-gray-200 h-6 w-1/1 rounded-xs animate-pulse"></div>
      <div class="bg-gray-100 h-6 w-full rounded-xs animate-pulse"></div>
      <div class="bg-gray-50 h-6 w-full rounded-xs animate-pulse"></div>
    </div>
  </li>
{/snippet} -->

{#snippet thread(c: any)}
  {@const user = userStore.get(c.partnerUid)}
  {@const cid = c.id}
  <li id={cid.toString()}>
    <a href="/chat/c_{cid}" onclick={() => handleClick(c.state, user?.id, cid)}>
      <div
        class="flex items-center hover:bg-gray-100 px-2 py-1"
        style:background-color={`c_${cid}` === activeCid ? "orange" : ""}
      >
        <!-- 1. gender icon -->
        <span><GenderIcon gender={user?.gender} /></span>

        <!-- 2. name -->
        <span class="ml-1">
          {user?.username}
        </span>

        <!-- 3. flag and unreadCount -->
        <div class="ml-auto flex items-center justify-end gap-2">
          <span>{user?.country}</span>
          <span class={` fi fi-${user?.country.toLocaleLowerCase()}`}> </span>
          {#if c.state}
            {@render unreadCount(c.state.unread as number)}
          {/if}
        </div>
      </div>
    </a>
  </li>
{/snippet}

{#snippet unreadCount(n: number)}
  {#if n && n > 0}
    <span
      class="w-5 h-5 p-2 rounded-full bg-red-600 flex items-center text-xs justify-center text-white"
    >
      {n}</span
    >
  {:else}
    <span>
      <CheckCheck size={12} />
    </span>
  {/if}
{/snippet}
