<script lang="ts">
  import { subscribeToConversation } from "$lib/store/managers/entities/conversation.svelte";
  import * as receiptManager from "$lib/store/managers/entities/receipt.svelte";
  import { chatStore, type PrivateConversation } from "$lib/store/store.svelte";
  import { onMount } from "svelte";
  import GenderIcon from "../GenderIcon.svelte";
  import { type UIConversation } from "$lib/types/chat";

  let { showUsers = $bindable() } = $props();

  $inspect({ _conversations: chatStore._conversations });

  onMount(async () => {
    if (!chatStore.activeConversation?.conversationId) return;

    await chatStore.loadInitialMessages({
      conversationId: chatStore.activeConversation?.conversationId,
    });
  });
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

    // chatStore.clearNotification(conversation.conversationId!);
    // chatStore.activeConversation = conversation;
    // chatStore.target = {
    //   user: conversation.user,
    //   isUser: false,
    //   conversationId: conversation.conversationId!,
    //   unreadCount: 0,
    // };

    // await receiptManager.emitMarkAllRead({
    //   conversationId: conversation.conversationId,
    //   currentuserId: chatStore.currentUser?.id!,
    //   senderId: conversation.user.id,
    // });

    // // Load messages for current conversation
    // // await chatStore.loadMessages();
    // await chatStore.loadInitialMessages({
    //   conversationId: conversation.conversationId,
    // });

    // const userId = chatStore.currentUser?.id;
    // await subscribeToConversation({ conversation, userId });
  };
</script>

<div class="flex-1 flex flex-col overflow-hidden">
  <ul class=" overflow-y-auto w-full">
    {#if Object.keys(chatStore.conversations).length < 0}
      {@render userItemRowSkeleton()}
    {:else}
      {#each Object.values(chatStore._conversations) as conversation}
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

{#snippet userItemRow(conversation: UIConversation)}
  <li>
    <div class="flex items-center gap-1 w-full relative group">
      <a
        href={`/chat/c_${conversation.conversationId}`}
        class="px-2 py-1 w-full hover:bg-gray-300 relative flex gap-1 border-gray-200 {conversation.conversationId ===
        chatStore.activeConversation?.conversationId
          ? 'bg-gray-400'
          : ''}"
        id={conversation.partner.id.toString()}
        onmouseenter={async () => {
          // TODO optimize it
          // await chatStore.preloadMessages({
          //     conversationId: conversation.conversationId,
          // });
        }}
        onclick={() => handleClick(conversation)}
      >
        <div class="flex items-center gap-2 w-full overflow-hidden">
          <GenderIcon gender={conversation.partner.gender} />
          <span class="truncate">
            {#if conversation.partner.id === chatStore.currentUser?.id}
              You
            {:else}
              {conversation.partner.username}
            {/if}
          </span>

          {#if conversation.partner.country && conversation.partner.country !== "0"}
            <span
              class="font-bold ml-auto text-xs shrink-0 flex items-center gap-1"
            >
              {conversation.partner.country}
              <span
                class={`fi fi-${conversation.partner.country.toLocaleLowerCase()}`}
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
      </a>
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
