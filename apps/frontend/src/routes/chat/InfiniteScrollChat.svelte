<script lang="ts">
  import { chatStore } from "$lib/store.svelte";
  import { onMount, tick } from "svelte";
  import { Check, CheckCheck } from "@lucide/svelte";
  import { Loader } from "@lucide/svelte";
  import type { ChatEntry } from "$lib/store.svelte";

  type ResponseData = { chat: ChatEntry[]; hasMore: boolean };

  const LIMIT = $derived(chatStore.LIMIT);

  const user_id = $derived(chatStore.currentUser?.id);
  const conversation_id = $derived(
    chatStore.activeConversation?.conversation_id,
  );

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
  //   let itemHeight = $state(88);

  let isLoadingOlder = $state(false);
  let isLoadingNewer = $state(false);
  let hasMoreOlder = $state(true);
  let hasMoreNewer = $state(true);

  // Replace: let itemHeight = 88;
  // Key by message_id instead of index
  let heightCache = $state<Record<number, number>>({});
  const ESTIMATED_HEIGHT = 80;

  // Helper to get height or fallback to estimate
  function getItemHeight(id: number) {
    return heightCache[id] ?? ESTIMATED_HEIGHT;
  }

  // Use a shared ResizeObserver for performance
  let resizeObserver: ResizeObserver;
  const elementToId = new Map<HTMLElement, number>();

  function getObserver() {
    if (!resizeObserver) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const id = elementToId.get(entry.target as HTMLElement);
          if (id !== undefined) {
            const newHeight = (entry.target as HTMLElement).offsetHeight;
            if (heightCache[id] !== newHeight) {
              heightCache[id] = newHeight;
            }
          }
        }
      });
    }
    return resizeObserver;
  }

  // Clear cache when conversation changes
  $effect(() => {
    // dependency
    conversation_id;
    heightCache = {};
  });

  // Calculate where each item should start
  let offsets = $derived.by(() => {
    let currentOffset = 0;
    return chatStore.activeMessages.map((msg) => {
      const pos = currentOffset;
      // Use message_id logic
      currentOffset += getItemHeight(msg.message.message_id);
      return pos;
    });
  });

  // Calculate total list height dynamically
  let totalHeight = $derived(
    offsets.length > 0
      ? offsets[offsets.length - 1] +
          getItemHeight(
            chatStore.activeMessages[offsets.length - 1].message.message_id,
          )
      : 0,
  );

  $inspect({ totalHeight, offsets });

  let startIndex = $derived(
    offsets.findIndex((offset) => offset + ESTIMATED_HEIGHT > scrollTop),
  );

  let endIndex = $derived(
    offsets.findIndex((offset) => offset > scrollTop + height),
  );

  // Fallbacks for initial load or end of list
  let safeStartIndex = $derived(
    startIndex === -1 ? 0 : Math.max(0, startIndex - 2),
  );

  let safeEndIndex = $derived(
    endIndex === -1
      ? chatStore.activeMessages.length
      : Math.min(chatStore.activeMessages.length, endIndex + 2),
  );

  let visibleList = $derived(
    chatStore.activeMessages
      .slice(safeStartIndex, safeEndIndex)
      .map((entry, idx) => ({
        entry,
        index: safeStartIndex + idx,
      })),
  );

  function measure(node: HTMLElement, id: number) {
    const ob = getObserver();
    elementToId.set(node, id);
    ob.observe(node);

    // Initial measure
    const initialHeight = node.offsetHeight;
    if (heightCache[id] !== initialHeight) {
      heightCache[id] = initialHeight;
    }

    return {
      destroy: () => {
        ob.unobserve(node);
        elementToId.delete(node);
      },
    };
  }

  function handleScroll() {
    if (scrollElement) {
      scrollTop = scrollElement.scrollTop;
      // Height is bound via bind:clientHeight, no need to read it here which causes reflow
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
      },
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

    // 1. Capture Anchor (Top-most visible message)
    const firstVisibleIndex =
      startIndex !== -1 ? startIndex : Math.max(0, safeStartIndex);
    const anchorMsg = chatStore.activeMessages[firstVisibleIndex];
    const oldAnchorOffset = offsets[firstVisibleIndex] || 0;

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
        },
      );
      const data: ResponseData = await response.json();
      hasMoreOlder = data.hasMore ?? false;

      if (data.chat.length > 0) {
        chatStore.loadOlderMessages(conversation_id, Array.from(data.chat));

        // Wait for DOM to update and measures to happen
        await tick();

        if (anchorMsg && scrollElement) {
          // 2. Find where anchor went
          const newAnchorIndex = chatStore.activeMessages.findIndex(
            (m) => m.message.message_id === anchorMsg.message.message_id,
          );

          if (newAnchorIndex !== -1) {
            // 3. Calculate delta and correct scroll
            const newAnchorOffset = offsets[newAnchorIndex];
            const delta = newAnchorOffset - oldAnchorOffset;
            scrollElement.scrollTop += delta;
          }
        }
      }
    } finally {
      isLoadingOlder = false;
    }
  }

  async function handleLoadNewer() {
    if (!hasMoreNewer) return;
    isLoadingNewer = true;

    // 1. Capture Anchor (Top-most visible message)
    const firstVisibleIndex =
      startIndex !== -1 ? startIndex : Math.max(0, safeStartIndex);
    const anchorMsg = chatStore.activeMessages[firstVisibleIndex];
    const oldAnchorOffset = offsets[firstVisibleIndex] || 0;

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
        },
      );
      const data: ResponseData = await response.json();
      hasMoreNewer = data.hasMore ?? false;
      if (data.chat.length > 0) {
        // Optimization: Just pass the new messages, store handles merging.
        // Also fixes potential prepend/append confusion.
        chatStore.loadNewerMessages(conversation_id, Array.from(data.chat));

        // Wait for DOM to update and measures to happen
        await tick();

        if (anchorMsg && scrollElement) {
          // 2. Find where anchor went
          const newAnchorIndex = chatStore.activeMessages.findIndex(
            (m) => m.message.message_id === anchorMsg.message.message_id,
          );

          if (newAnchorIndex !== -1) {
            // 3. Calculate delta and correct scroll (handles trimming shifts)
            const newAnchorOffset = offsets[newAnchorIndex];
            const delta = newAnchorOffset - oldAnchorOffset;
            if (delta !== 0) {
              scrollElement.scrollTop += delta;
            }
          }
        }
      }
    } finally {
      isLoadingNewer = false;
    }
  }
</script>

<div
  bind:this={scrollElement}
  bind:clientHeight={height}
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
    style:height="{totalHeight}px"
    class="h-full relative w-full"
    onscroll={handleScroll}
  >
    {#if isLoadingOlder}
      {@render oldLoader()}
    {/if}
    {#if !hasMoreOlder}
      {@render startOfConversation()}
    {/if}

    {#each visibleList as { entry, index } (entry.message.message_id)}
      <li
        use:measure={entry.message.message_id}
        style:width="100%"
        style:transform="translateY({offsets[index]}px)"
        class="absolute left-0 top-0 py-2"
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
      class="flex flex-col p-2 bg-gray-200 w-max max-w-[70%] px-3 rounded-lg list-none"
    >
      <div>
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
      class="flex flex-col bg-gray-500 text-white ml-auto p-2 px-3 rounded-lg list-none w-max max-w-[70%]"
    >
      <div>
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
