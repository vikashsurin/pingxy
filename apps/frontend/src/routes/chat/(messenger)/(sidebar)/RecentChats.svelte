<script lang="ts">
  import { page } from "$app/state";
  import { messageStore } from "$lib/stores/messageStore.svelte";
  import { chatStore } from "$lib/stores/store.svelte";
  import { type UIConversation } from "$lib/types/chat";
  import GenderIcon from "../GenderIcon.svelte";

  let urlArray = $derived(page.url.pathname.split("/"));

  const handleClick = async (conversation: UIConversation) => {
    if (!conversation.conversationId) return;

    chatStore.chatTarget = {
      isUser: false,
      type: "direct",
      displayName: conversation.displayName,
      partner: conversation.partner,
      unreadCount: conversation.unreadCount,
      participants: conversation.participants,
      conversationId: conversation.conversationId,
    };
  };
</script>

<div class="flex-1 flex flex-col overflow-hidden">
  <ul class=" overflow-y-auto w-full">
    {#each messageStore.threads as [id, value] (id)}
      {@render thread(id)}
    {/each}
  </ul>
</div>

{#snippet userItemRowSkeleton()}
  <li>
    <div class="p-3 flex flex-col gap-2">
      <div class="bg-gray-300 h-6 w-1/2 rounded-xs animate-pulse"></div>
      <div class="bg-gray-200 h-6 w-1/1 rounded-xs animate-pulse"></div>
      <div class="bg-gray-100 h-6 w-full rounded-xs animate-pulse"></div>
      <div class="bg-gray-50 h-6 w-full rounded-xs animate-pulse"></div>
    </div>
  </li>
{/snippet}

{#snippet thread(id: number)}
  {@const chat = messageStore.chats.get(id)}
  <li id={id.toString()}>
    <a href="/chat/c_{id}">
      <div
        class="flex items-center hover:bg-gray-100 px-2 py-1"
        style:background-color={`c_${id}` === urlArray.at(-1) ? "orange" : ""}
      >
        <!-- 1. gender icon -->
        <span><GenderIcon gender={chat?.partner?.gender} /></span>

        <!-- 2. name -->
        <span class="ml-1">
          {chat?.displayName}
        </span>

        <!-- 3. flag and unreadCount -->
        <div class="ml-auto flex items-center justify-end gap-2">
          <span>{chat?.partner?.country}</span>
          <span class={` fi fi-${chat?.partner?.country.toLocaleLowerCase()}`}>
          </span>
          <span
            class="w-4 h-4 p-2 rounded-full bg-red-600 flex items-center font-xs justify-center text-white"
            >{chat?.unreadCount}</span
          >
        </div>
      </div>
    </a>
  </li>
{/snippet}
