<script lang="ts">
  import { chatStore } from "$lib/store.svelte";
  import { type Message } from "@chat/shared/src/lib/utils/validation";
  import ChatboxHeader from "./ChatboxHeader.svelte";
  import ChatInput from "./ChatInput.svelte";

  const messages = $derived(
    chatStore.messages.get(chatStore?.activeConversation?.conversation_id!),
  );
</script>

<div class="border flex flex-col h-full">
  <ChatboxHeader />
  <div
    class="flex flex-col gap-2 p-2 border-2 border-red-500 overflow-y-auto h-[calc(100%-100px)]"
  >
    {#each messages as message}
      {@render messageItem(message)}
    {/each}
  </div>
  <ChatInput />
</div>

{#snippet messageItem(message: Message)}
  {#if message.sender_id !== chatStore.currentUser?.id}
    <div class="flex p-2 bg-gray-200 w-max px-3 rounded-sm">
      <span>{message.content}</span>
    </div>
  {:else}
    <div class="flex flex-col bg-gray-200 ml-auto p-2 px-3 rounded-sm">
      <span>{message.content}</span>
      <span class="text-xs"
        >{new Date(message.created_at! * 1000).toLocaleString([], {
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        })}</span
      >
    </div>
  {/if}
{/snippet}
