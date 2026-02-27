<script lang="ts">
  import { validateSocket } from "$lib/store/helpers.js";
  import { emitMarkAllRead } from "$lib/store/managers/entities/receipt.svelte.js";
  import { messageStore } from "$lib/store/messageStore.svelte.js";
  import { formatLocalTime } from "$lib/utils/time.js";
  import { Check, CheckCheck } from "@lucide/svelte";
  import { type MessageReceipt } from "@pingxy/shared";
  import ChatHeader from "./ChatHeader.svelte";
  import ChatInput from "./ChatInput.svelte";

  let { data } = $props();

  $effect(() => {
    if (data.messages.items) {
      messageStore.setMessages(data.messages.items);
    }
  });

  const messageIds = $derived(
    Array.from(messageStore.threads.get(data.idValue) || []),
  );

  const interSectionObserver = (node: HTMLElement, callback: () => void) => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        callback();
      }
    }, {});

    observer.observe(node);
    return {
      destroy() {
        observer.disconnect();
      },
    };
  };

  function loadOlder() {
    console.log("loading older");
  }

  let messageListRef: HTMLElement | undefined;

  $effect(() => {
    if (!data.identifier.startsWith("c_")) return;

    const conversationId = data.idValue;
    // TODO fix this: sender reader
    const currentuserId = data.user.id;
    const senderId = data.partner.id;

    messageStore.activeChatId = conversationId;

    const socket = validateSocket();
    if (!socket) return;

    emitMarkAllRead({ conversationId, currentuserId, senderId }).catch((err) =>
      console.error("Failed to mark as read:", err),
    );
  });

  $effect(() => {
    if (!messageListRef) return;
    if (!messageIds) return;
    messageListRef?.scrollTo({
      top: messageListRef.scrollHeight,
      behavior: "smooth",
    });
  });

  function loadNewer() {
    console.log("loading newer");
  }
</script>

<div id="chatbox" class="flex flex-col h-full">
  <ChatHeader partner={data.partner} />
  <div bind:this={messageListRef} class="flex-1 overflow-y-auto min-h-0">
    <div class="bg-amber-400" use:interSectionObserver={loadOlder}>top</div>
    {#each messageIds as id (id)}
      {@const entry = messageStore.messages.get(id)}
      {#if entry}
        <div class="message flex">
          {#if entry.message.senderId === data.user.id}
            <div
              class="bg-blue-100 flex flex-col justify-end border max-w-1/2 ml-auto px-2 py-1"
            >
              <span id={entry.message.messageId.toString()}
                >{entry.message.content}</span
              >
              <span id="meta-data" class="flex justify-between items-end gap-2">
                <span class="text-xs opacity-60"
                  >{formatLocalTime(entry.message.createdAt)}</span
                >
                {@render receipt(entry.receipt)}
              </span>
            </div>
          {:else}
            <div
              class="bg-gray-300 flex flex-col justify-start border max-w-1/2 px-2 py-1"
            >
              <span id={entry.message.messageId.toString()} class="sender"
                >{entry.message.content}</span
              >
              <span id="meta-data" class="flex justify-start items-start gap-2">
                <span class="text-xs opacity-60">
                  {formatLocalTime(entry.message.createdAt)}</span
                >
              </span>
            </div>
          {/if}
        </div>
      {/if}
    {/each}
    <div class="bg-amber-400" use:interSectionObserver={loadNewer}>bottom</div>
  </div>
  <ChatInput partner={data.partner} identifier={data.identifier} />
</div>

{#snippet receipt(receipt: MessageReceipt)}
  {#if receipt.status === "sent"}
    <Check size={14} />
  {:else if receipt.status === "delivered"}
    <CheckCheck size={14} />
  {:else if receipt.status === "read"}
    <CheckCheck size={14} class="text-blue-500" />
  {/if}
{/snippet};

<style>
  /* @import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Roboto+Slab:wght@100..900&display=swap");

  #chatbox {
    font-family: "Roboto Slab", serif;
    font-optical-sizing: auto;
    font-weight: 400;
    font-style: normal;
  }

  @import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&display=swap");

  #meta-data {
    font-family: "IBM Plex Sans", sans-serif;
    font-optical-sizing: auto;
    font-weight: 400;
    font-style: normal;
  } */
</style>
