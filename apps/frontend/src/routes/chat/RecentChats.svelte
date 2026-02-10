<script lang="ts">
  import {
    getAllConversations,
    subscribeToConversation,
  } from "$lib/store/managers/entities/conversation.svelte";
  import * as receiptManager from "$lib/store/managers/entities/receipt.svelte";
  import { chatStore, type PrivateConversation } from "$lib/store/store.svelte";
  import { onMount } from "svelte";
  import GenderIcon from "./GenderIcon.svelte";

  onMount(async () => {
    await getAllConversations();
  });

  const handleClick = async (conversation: PrivateConversation) => {
    if (!conversation.conversationId) return;

    chatStore.clearNotification(conversation.conversationId!);
    chatStore.activeConversation = conversation;
    chatStore.target = {
      user: conversation.user,
      isUser: false,
      conversationId: conversation.conversationId!,
      unreadCount: 0,
    };

    await receiptManager.emitMarkAllRead({
      conversationId: conversation.conversationId,
      currentuserId: chatStore.currentUser?.id!,
      senderId: conversation.user.id,
    });

    // Load messages for current conversation
    // await chatStore.loadMessages();
    await chatStore.loadInitialMessages({
      conversationId: conversation.conversationId,
    });

    const userId = chatStore.currentUser?.id;
    await subscribeToConversation({ conversation, userId });
  };
</script>

<div class="flex-1 flex flex-col overflow-hidden">
  <ul class=" overflow-y-auto w-full">
    {#if Object.keys(chatStore.conversations).length < 0}
      {@render userItemRowSkeleton()}
    {:else}
      {#each Object.values(chatStore.conversations) as conversation}
        {@render userItemRow(conversation)}
      {/each}
    {/if}
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

{#snippet userItemRow(conversation: PrivateConversation)}
  <li>
    <div class="flex items-center gap-1 w-full relative group">
      <button
        class="px-2 py-1 w-full hover:bg-gray-300 relative flex gap-1 border-gray-200 {conversation.conversationId ===
        chatStore.activeConversation?.conversationId
          ? 'bg-gray-400'
          : ''}"
        id={conversation.user.id.toString()}
        onmouseenter={async () => {
          // TODO optimize it
          // await chatStore.preloadMessages({
          //     conversationId: conversation.conversationId,
          // });
        }}
        onclick={async () => {
          handleClick(conversation);
        }}
      >
        <div class="flex items-center gap-2 w-full overflow-hidden">
          <GenderIcon gender={conversation.user.data.gender} />
          <span class="truncate">
            {#if conversation.user.id === chatStore.currentUser?.id}
              You
            {:else}
              {conversation.user.username}
            {/if}
          </span>

          {#if conversation.user.data.country && conversation.user.data.country !== "0"}
            <span
              class="font-bold ml-auto text-xs shrink-0 flex items-center gap-1"
            >
              {conversation.user.data.country}
              <span
                class={`fi fi-${conversation.user.data.country.toLocaleLowerCase()}`}
              >
              </span>
            </span>
            {#if conversation.unreadCount && conversation.unreadCount > 0}
              <span
                class="text-xs bg-red-600 p-1 h-5 w-5 flex items-center justify-center text-white rounded-full border border-red-800"
              >
                {conversation.unreadCount}
              </span>
            {:else}
              <span></span>
            {/if}
          {/if}
        </div>

        {@render unreaStatus(conversation.conversationId!)}
      </button>
    </div>
  </li>
{/snippet}
{#snippet unreaStatus(id: number)}
  {#if chatStore.notifications.has(id)}
    <span
      class="w-4 h-4 rounded-full bg-red-600 animate-pulse text-[10px] flex items-center justify-center text-white ml-auto"
    >
      {chatStore.notifications.size}
    </span>
  {/if}
{/snippet}
