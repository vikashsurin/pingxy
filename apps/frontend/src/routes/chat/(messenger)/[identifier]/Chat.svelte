<script lang="ts">
  import { attachmentStore } from "$lib/stores/attachmentStore.svelte";
  import { conversationStore } from "$lib/stores/conversationStore.svelte";
  import { fileStore } from "$lib/stores/fileStore.svelte";
  import { messageStore } from "$lib/stores/messageStore.svelte";
  import { receiptStore } from "$lib/stores/receiptStore.svelte";
  import { formatLocalTime } from "$lib/utils/time";
  import { Check, CheckCheck } from "@lucide/svelte";
  import { type Message } from "@pingxy/shared";
  import { tick, untrack } from "svelte";
  import { SvelteMap } from "svelte/reactivity";

  let { idValue, user } = $props();

  const ESTIMATED_HEIGHT = 74;

  // ── Data ──────────────────────────────────────────────────────────────────

  const messageIds = $derived.by(() => {
    return Array.from(messageStore.threads.get(idValue) || []).sort(
      (a, b) => a - b,
    );
  });

  const oldestMessageId = $derived(messageIds[0]);
  const newestMessageId = $derived(messageIds[messageIds.length - 1]);

  // ── DOM refs & scroll state ───────────────────────────────────────────────

  let messageListRef = $state<HTMLElement | undefined>();
  let scrollTop = $state(0);
  const containerHeight = $derived(messageListRef?.clientHeight ?? 0);

  // ── Virtual sizing ────────────────────────────────────────────────────────

  const measuredHeights = new SvelteMap<number, number>();
  const virtualOffsets = new SvelteMap<number, number>();

  // recompute offsets whenever messageIds or measuredHeights change
  $effect(() => {
    // touch both so the effect re-runs when either changes
    const ids = messageIds;
    const _ = measuredHeights.size;

    let cursor = 0;
    for (const id of ids) {
      virtualOffsets.set(id, cursor);
      cursor += measuredHeights.get(id) ?? ESTIMATED_HEIGHT;
    }
  });

  const totalVirtualHeight = $derived.by(() => {
    let h = 0;
    for (const id of messageIds) {
      h += measuredHeights.get(id) ?? ESTIMATED_HEIGHT;
    }
    return h;
  });

  // ── Visible window ────────────────────────────────────────────────────────

  const OVERSCAN = 3; // extra messages to render above and below viewport

  const visibleMessageIds = $derived.by(() => {
    const viewportTop = scrollTop;
    const viewportBottom = scrollTop + containerHeight;

    const inRange: number[] = [];

    for (const id of messageIds) {
      const offset = virtualOffsets.get(id) ?? 0;
      const height = measuredHeights.get(id) ?? ESTIMATED_HEIGHT;
      const bottom = offset + height;

      if (bottom > viewportTop && offset < viewportBottom) {
        inRange.push(id);
      }
    }

    // apply overscan: extend the visible slice by OVERSCAN items each side
    if (inRange.length === 0) return inRange;

    const firstVisible = messageIds.indexOf(inRange[0]);
    const lastVisible = messageIds.indexOf(inRange[inRange.length - 1]);

    const start = Math.max(0, firstVisible - OVERSCAN);
    const end = Math.min(messageIds.length - 1, lastVisible + OVERSCAN);

    return messageIds.slice(start, end + 1);
  });

  // ── Actions ───────────────────────────────────────────────────────────────

  const measureHeight = (
    node: HTMLElement,
    {
      id,
      onMeasure,
    }: { id: number; onMeasure: (id: number, height: number) => void },
  ) => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        onMeasure(id, entry.contentRect.height);
      }
    });
    observer.observe(node);
    return {
      destroy() {
        observer.disconnect();
      },
    };
  };

  function handleMeasure(id: number, height: number) {
    measuredHeights.set(id, height);
  }

  const interSectionObserver = (node: HTMLElement, callback: () => void) => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      {
        root: messageListRef,
        rootMargin: "0px",
      },
    );
    observer.observe(node);
    return {
      destroy() {
        observer.disconnect();
      },
    };
  };

  // ── Load older ────────────────────────────────────────────────────────────

  let isLoadingOlder = $state(false);
  let hasMoreOlder = $state(true);

  async function loadOlder() {
    if (isLoadingOlder) return;
    isLoadingOlder = true;

    // anchor: first visible message id and its current virtual offset
    const anchorId = visibleMessageIds[0];
    const anchorOffsetBefore = virtualOffsets.get(anchorId) ?? 0;

    const result = await messageStore.fetchOlderMessages({
      conversationId: idValue,
      userId: user.id,
      oldestId: oldestMessageId,
      limit: 30,
    });

    if (result) {
      if (!result.hasMore) hasMoreOlder = false;

      // TODO: CHECK THIS
      // result.items.forEach((item: any) => {
      //   messageStore.upsertMessage(item);
      // });
    }

    await tick();

    // after offsets recompute, restore scroll so anchor stays in place
    const anchorOffsetAfter = virtualOffsets.get(anchorId) ?? 0;
    const drift = anchorOffsetAfter - anchorOffsetBefore;
    if (messageListRef) {
      messageListRef.scrollTop += drift;
    }

    isLoadingOlder = false;
  }

  // -- Load newer ----------------------
  let isLoadingNewer = $state(false);
  // TODO: check has more, to fetch more data
  let hasMoreNewer = $state(true);

  async function loadNewer() {
    if (isLoadingNewer) return;
    isLoadingNewer = true;

    const result = await messageStore.fetchNewerMessages({
      conversationId: idValue,
      userId: user.id,
      newestId: newestMessageId,
      limit: 30,
    });

    if (result) {
      if (!result.hasMore) hasMoreNewer = false;
      // result.items.forEach((item: any) => {
      //   messageStore.upsertMessage(item);
      // });
    }

    await tick();
    isLoadingNewer = false;
  }

  // ── Scroll Handling ────────────────────────────────────────────────────────
  let previousLength = 0;

  $effect(() => {
    // 1. Dependency: This runs whenever the total message count changes
    const currentLength = messageIds.length;

    untrack(() => {
      // 2. Logic: Check if exactly one message was added to the end
      const isSingleNewMessage = currentLength === previousLength + 1;

      if (isSingleNewMessage && messageListRef) {
        // 3. Threshold check: Only auto-scroll if user is already near the bottom
        const threshold = 150;
        const isNearBottom =
          scrollTop + containerHeight >= totalVirtualHeight - threshold;

        if (isNearBottom) {
          // Wait for the next tick so the totalVirtualHeight and
          // virtualOffsets have finished re-calculating
          tick().then(() => {
            messageListRef!.scrollTo({
              top: totalVirtualHeight,
              behavior: "smooth",
            });
          });
        }
      }
      previousLength = currentLength;
    });
  });
</script>

<div
  bind:this={messageListRef}
  class="flex-1 overflow-y-auto min-h-0 relative"
  onscroll={(e) => (scrollTop = e.currentTarget.scrollTop)}
>
  <!-- spacer: gives the scrollbar the correct full height -->
  <div style="height: {totalVirtualHeight}px; position: relative;">
    <!-- load older sentinel: sits at the very top of the spacer -->
    {#if isLoadingOlder}
      <div
        class="flex bg-gray-300 items-center justify-center absolute top-0 w-full"
      >
        loading older messages...
      </div>
    {/if}

    {#if !hasMoreOlder}
      <div
        class="flex bg-gray-100 items-center text-xs py-1 px-2 rounded justify-center absolute left-1/2 -translate-x-1/2 text-gray-500 top-0 w-max"
      >
        start of conversation
      </div>
    {:else}
      <!-- <div
        class="bg-amber-400 h-0 absolute top-0 w-full"
        use:interSectionObserver={loadOlder}
      ></div> -->
    {/if}

    <!-- only visible messages are in the DOM, absolutely positioned -->
    {#each visibleMessageIds as id (id)}
      {@const entry:Message = messageStore.messages.get(id)}
      {#if entry}
        <div
          use:measureHeight={{ id, onMeasure: handleMeasure }}
          class="message flex absolute w-full"
          style="top: {virtualOffsets.get(id) ?? 0}px"
        >
          <!-- 1. me -->
          {#if entry.senderId === user.id}
            <div class=" flex flex-col justify-end p-1 max-w-1/2 ml-auto">
              <div class="bg-blue-100 p-3">
                <span class="font-bold">{entry.id}</span>
                <div class="flex flex-col">
                  {@render files(entry.id)}
                </div>

                <span>
                  {entry.content}
                </span>
                <div
                  id="meta-data"
                  class="flex justify-between items-center gap-2"
                >
                  <span class="text-xs flex opacity-60">
                    {formatLocalTime(entry.createdAt)}
                  </span>
                  <span>
                    {@render receipt(entry.id!, entry.conversationId)}
                  </span>
                </div>
              </div>
            </div>
          {:else}
            <!-- 2. Partner -->
            <div class="p-1">
              <div class="bg-gray-100 grid p-3">
                {@render files(entry.id!)}

                <span id={entry.id.toString()} class="sender">
                  {entry.content}
                </span>
                <span
                  id="meta-data"
                  class="flex justify-start items-start gap-2"
                >
                  <span class="text-xs opacity-60">
                    {formatLocalTime(entry.createdAt)}
                  </span>
                </span>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    {/each}

    <!-- load newer sentinel: sits at the very bottom of the spacer -->
    <!-- <div
      class="bg-amber-400 absolute bottom-0 w-full h-0"
      use:interSectionObserver={loadNewer}
    ></div> -->
  </div>
</div>

{#snippet receipt(msgId: number, cid: number)}
  {@const pid = conversationStore.getPartnerPid(cid)}
  {@const pp = conversationStore.pp.get(pid ?? -1)}
  {#if pp}
    {#if pp.lastReadMessageId >= msgId}
      <CheckCheck size={14} class="text-blue-500" />
    {:else if pp.lastDeliveredMessageId >= msgId}
      <CheckCheck size={14} />
    {:else}
      <Check size={14} />
    {/if}
  {/if}
{/snippet}

{#snippet files(msgId: number)}
  {@const attachments = attachmentStore.getFilesForMessage(msgId)}

  {#each attachments as file (file?.attachmentId)}
    <button onclick={() => (fileStore.viewSelected = file?.url)}>
      <img
        src={file?.thumbUrl}
        alt={file?.fileName || ""}
        class="rounded-none max-w-xs mb-2"
        loading="lazy"
      />
    </button>
  {/each}
{/snippet}
