<script lang="ts">
  import { chatStore } from "$lib/store.svelte";
  import ChatboxHeader from "./ChatboxHeader.svelte";
  import ChatInput from "./ChatInput.svelte";
  import { onMount, tick } from "svelte";
  import { Check, CheckCheck } from "@lucide/svelte";
  import { Loader } from "@lucide/svelte";
  import type { ChatEntry } from "$lib/store.svelte";

  type ResponseData = { chat: ChatEntry[]; hasMore: boolean };

  const LIMIT = $derived(chatStore.LIMIT);

  const user_id = $derived(chatStore.currentUser?.id);
  const conversation_id = $derived(
    chatStore.activeConversation?.conversation_id
  );

  // $inspect({ messages: chatStore.messages });
  $inspect({ count: chatStore.getMessageCount(conversation_id!) });

  onMount(() => {
    if (conversation_id) {
      chatStore.loadInitialMessages({
        conversation_id: conversation_id,
      });
    }
  });

  // --- Element State ---
  let scrollElement: HTMLDivElement | undefined = $state();
  let scrollTop = $state(0);
  let height = $state(0);
  let itemHeight = $state(88);

  let startIndex = $derived(Math.floor(scrollTop / itemHeight));
  let endIndex = $derived(startIndex + Math.ceil(height / itemHeight));

  let isLoadingOlder = $state(false);
  let isLoadingNewer = $state(false);
  let hasMoreOlder = $state(true);
  let hasMoreNewer = $state(true);

  let visibleList = $derived(
    chatStore.activeMessages
      .slice(startIndex, endIndex + 1)
      .map((entry, idx) => ({
        entry,
        index: startIndex + idx,
      }))
  );

  function handleScroll() {
    if (scrollElement) {
      scrollTop = scrollElement.scrollTop;
      height = scrollElement.clientHeight;
    }
  }

  onMount(() => {
    if (scrollElement) {
      height = scrollElement.clientHeight;
    }
  });

  // --- Intersection Observer  ---
  function intersectionObserver(node: HTMLElement, callback: () => void) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      {
        root: scrollElement,
        rootMargin: "400px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(node);

    return {
      destroy() {
        observer.disconnect();
      },
    };
  }

  async function handleLoadOlder() {
    if (!hasMoreOlder) return;
    isLoadingOlder = true;

    if (!conversation_id || !user_id) {
      return;
    }

    const oldestId = chatStore.getOldestMessageId(conversation_id);
    try {
      const response = await fetch(
        `http://localhost:3000/api/conversations/${conversation_id}/messages/${user_id}?before=${oldestId}&limit=${LIMIT}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data: ResponseData = await response.json();
      hasMoreOlder = data.hasMore ?? false;
      if (data.chat.length > 0) {
        let newMessages = [
          ...Array.from(data.chat),
          ...chatStore.activeMessages,
        ];
        chatStore.loadOlderMessages(conversation_id, newMessages);
      }
    } finally {
      if (hasMoreOlder) {
        scrollElement?.scrollBy({
          top: 20 * itemHeight,
          behavior: "instant",
        });
      }

      isLoadingOlder = false;
    }
  }

  async function handleLoadNewer() {
    if (!hasMoreNewer) return;
    isLoadingNewer = true;
    if (!conversation_id || !user_id) {
      return;
    }

    const newestId = chatStore.getNewestMessageId(conversation_id);
    try {
      const response = await fetch(
        `http://localhost:3000/api/conversations/${conversation_id}/messages/${user_id}?after=${newestId}&limit=${LIMIT}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data: ResponseData = await response.json();
      hasMoreNewer = data.hasMore ?? false;
      if (data.chat.length > 0) {
        let newMessages = [
          ...Array.from(data.chat),
          ...chatStore.activeMessages,
        ];
        chatStore.loadNewerMessages(conversation_id, newMessages);
      }
    } finally {
      if (hasMoreNewer) {
        scrollElement?.scrollBy({
          top: -20 * itemHeight,
          behavior: "instant",
        });
      }
      isLoadingNewer = false;
    }
  }
</script>

<div class="flex flex-col h-full overflow-hidden">
  <ChatboxHeader />

  <div
    bind:this={scrollElement}
    data-virtual-list
    style:height="100%"
    class=" flex-1 overflow-auto border-4"
    onscroll={handleScroll}
  >
    <div
      use:intersectionObserver={handleLoadOlder}
      data-infinite-scroll-trigger="older"
      class="h-1 w-full"
      aria-hidden="true"
    ></div>
    <ul
      style:height="{chatStore.activeMessages.length * itemHeight}px"
      class="h-full relative w-full"
      onscroll={handleScroll}
    >
      {#if isLoadingOlder}
        {@render oldLoader()}
      {/if}
      {#if !hasMoreOlder}
        {@render startOfConversation()}
      {/if}

      {#each visibleList as { entry, index } (index)}
        <li
          style:height="{itemHeight}px"
          style:width="100%"
          style:transform="translateY({index * itemHeight}px)"
          class="absolute"
        >
          {@render messageItem(entry)}
        </li>
      {/each}

      {#if isLoadingNewer}
        {@render newLoader()}
      {/if}
    </ul>

    <div
      use:intersectionObserver={handleLoadNewer}
      data-infinite-scroll-trigger="newer"
      class="h-1 w-full"
      aria-hidden="true"
    ></div>
  </div>

  <ChatInput />
</div>

<!--  Snippets -->

{#snippet oldLoader()}
  <div
    class="absolute top-0 w-full flex justify-center items-center h-7.5 z-10"
  >
    <span
      class="flex gap-1 items-center text-xs bg-gray-100/90 backdrop-blur-sm text-gray-500 py-1 px-3 rounded-full shadow-sm"
    >
      <Loader size={12} class="animate-spin" />
      Loading older messages...
    </span>
  </div>
{/snippet}

{#snippet newLoader()}
  <div
    class="absolute bottom-0 w-full text-center py-2 h-10 flex items-center justify-center text-amber-500 z-10"
  >
    <span
      class="flex gap-1 items-center text-xs bg-gray-100/90 backdrop-blur-sm text-gray-500 py-1 px-3 rounded-full shadow-sm"
    >
      <Loader size={12} class="animate-spin" />
      Loading newer messages...
    </span>
  </div>
{/snippet}

{#snippet startOfConversation()}
  <div class=" w-full flex justify-center items-center h-7.5">
    <span class="text-xs rounded-full bg-gray-100 text-gray-400 py-1 px-2">
      Start of conversation
    </span>
  </div>
{/snippet}

<!-- Snippet: Message Item -->
{#snippet messageItem(item: ChatEntry)}
  {#if item.message.sender_id !== chatStore.currentUser?.id}
    <div
      class="flex flex-col p-2 bg-gray-200 w-max max-w-[70%] px-3 rounded-lg mb-2 list-none"
    >
      <div class="bg-amber-500">
        <span class="font-bold text-xl">{item.message.message_id}</span>
        <span class="whitespace-pre-wrap">{item.message.content}</span>
        <span class="text-xs text-gray-600 mt-1">
          {new Date(item.message.created_at).toLocaleString([], {
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })}
        </span>
      </div>
    </div>
  {:else}
    <div
      class="flex flex-col bg-gray-500 text-white ml-auto p-2 px-3 rounded-lg mb-2 list-none w-max max-w-[70%]"
    >
      <div class="bg-amber-500">
        <span class="font-bold text-xl">{item.message.message_id}</span>

        <span class="whitespace-pre-wrap">{item.message.content}</span>
        <span
          class="text-xs flex items-center justify-end gap-2 opacity-90 mt-1"
        >
          {new Date(item.message.created_at).toLocaleString([], {
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })}
          {#if item.receipt.status === "sent"}
            <Check size={14} />
          {:else if item.receipt.status === "delivered"}
            <CheckCheck size={14} />
          {:else if item.receipt.status === "read"}
            <CheckCheck size={14} class="text-blue-200" />
          {/if}
        </span>
      </div>
    </div>
  {/if}
{/snippet}
