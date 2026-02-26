<script lang="ts">
  /**
   * VirtualMessageList.svelte
   * ─────────────────────────────────────────────────────────────────
   * Bi-directional infinite virtual scroll for chat messages.
   * Uses @tanstack/virtual-core directly for full Svelte 5 runes compat.
   *
   * Install:  npm i @tanstack/virtual-core
   *
   * Props:
   *   messages          – reactive array of message objects
   *   getItemKey        – (msg, index) => unique key
   *   estimateSize      – (msg) => estimated px height (default 80)
   *   hasOlderMessages  – whether there are more messages above
   *   hasNewerMessages  – whether there are more messages below
   *   loadOlder         – async () => void  — called when near top
   *   loadNewer         – async () => void  — called when near bottom
   *   stickToBottom     – auto-scroll when new messages arrive (default true)
   *   overscan          – extra items rendered outside viewport (default 5)
   *   loadThreshold     – trigger load when within N items of edge (default 3)
   *   class             – extra CSS classes on the scroll container
   *
   * Snippets:
   *   {#snippet message(msg, index)}  — renders one message row (required)
   *   {#snippet loader()}             — custom loading indicator (optional)
   *
   * Exported methods (via bind:this):
   *   scrollToBottom(behavior?)
   *   scrollToIndex(index, options?)
   */

  import { Virtualizer } from "@tanstack/virtual-core";
  import { tick, untrack } from "svelte";

  // ─── Types ────────────────────────────────────────────────────────
  type AnyMessage = Record<string, any>;
  type VirtualizerInstance = Virtualizer<HTMLDivElement, Element>;
  type VirtualItem = ReturnType<VirtualizerInstance["getVirtualItems"]>[number];

  interface Props {
    messages: AnyMessage[];
    getItemKey?: (msg: AnyMessage, index: number) => string | number;
    estimateSize?: (msg: AnyMessage) => number;
    hasOlderMessages?: boolean;
    hasNewerMessages?: boolean;
    loadOlder?: () => Promise<void>;
    loadNewer?: () => Promise<void>;
    stickToBottom?: boolean;
    overscan?: number;
    loadThreshold?: number;
    class?: string;
    message: import("svelte").Snippet<[AnyMessage, number]>;
    loader?: import("svelte").Snippet;
  }

  let {
    messages = [],
    getItemKey = (msg, i) => msg.id ?? msg.messageId ?? i,
    estimateSize = () => 80,
    hasOlderMessages = false,
    hasNewerMessages = false,
    loadOlder,
    loadNewer,
    stickToBottom = true,
    overscan = 5,
    loadThreshold = 3,
    class: className = "",
    message: messageSnippet,
    loader: loaderSnippet,
  }: Props = $props();

  // ─── DOM ref ──────────────────────────────────────────────────────
  let scrollEl = $state<HTMLDivElement | null>(null);

  // ─── Loading flags ────────────────────────────────────────────────
  let isLoadingOlder = $state(false);
  let isLoadingNewer = $state(false);

  // ─── Virtualizer reactive state ───────────────────────────────────
  let virtualItems = $state<VirtualItem[]>([]);
  let totalSize = $state(0);

  // ─── Internal bookkeeping ─────────────────────────────────────────
  let virtualizer: VirtualizerInstance | null = null;
  let initialized = false;
  let prevMessageCount = 0;

  // ─── Build virtualizer options ────────────────────────────────────
  function buildOptions() {
    return {
      count: messages.length,
      getScrollElement: () => scrollEl,
      estimateSize: (i: number) => estimateSize(messages[i]),
      overscan,
      getItemKey: (i: number) => getItemKey(messages[i], i),
      measureElement: (el: Element) =>
        (el as HTMLElement).getBoundingClientRect().height || 0,
      onChange: (instance: VirtualizerInstance) => {
        virtualItems = instance.getVirtualItems();
        totalSize = instance.getTotalSize();
      },
      scrollMargin: 0,
    };
  }

  // ─── Init virtualizer when scroll container mounts ────────────────
  $effect(() => {
    if (!scrollEl) return;

    virtualizer = new Virtualizer(buildOptions());
    const cleanup = virtualizer._didMount();
    virtualizer._willUpdate();

    virtualItems = virtualizer.getVirtualItems();
    totalSize = virtualizer.getTotalSize();

    // First load: jump straight to bottom (no animation)
    if (!initialized && messages.length > 0) {
      scrollEl.scrollTop = scrollEl.scrollHeight;
      initialized = true;
    }

    prevMessageCount = messages.length;

    return () => {
      cleanup?.();
      virtualizer = null;
    };
  });

  // ─── React to messages array length changes ───────────────────────
  $effect(() => {
    // Reactive read — messages.length is tracked here
    const newCount = messages.length;

    untrack(() => {
      if (!virtualizer || !scrollEl) return;

      const isPrepend = newCount > prevMessageCount && isLoadingOlder;
      const isAppend = newCount > prevMessageCount && !isLoadingOlder;

      // Capture scroll position BEFORE updating virtualizer (for prepend restore)
      const prevScrollHeight = scrollEl.scrollHeight;
      const prevScrollTop = scrollEl.scrollTop;
      const prevClientHeight = scrollEl.clientHeight;
      const distFromBottom =
        prevScrollHeight - prevScrollTop - prevClientHeight;

      // Push new options and re-sync
      virtualizer!.setOptions(buildOptions());
      virtualizer!._willUpdate();
      virtualItems = virtualizer!.getVirtualItems();
      totalSize = virtualizer!.getTotalSize();

      if (isPrepend) {
        // Restore scroll so the viewport stays on the same message
        tick().then(() => {
          if (!scrollEl) return;
          scrollEl.scrollTop =
            prevScrollTop + (scrollEl.scrollHeight - prevScrollHeight);
        });
      } else if (isAppend && stickToBottom && distFromBottom < 120) {
        // Stick to bottom only if user was already near the bottom
        tick().then(() => {
          scrollEl?.scrollTo({
            top: scrollEl.scrollHeight,
            behavior: "smooth",
          });
        });
      }

      prevMessageCount = newCount;
    });
  });

  // ─── Scroll event — drive virtualizer + check load triggers ──────
  function handleScroll() {
    if (!virtualizer || !scrollEl) return;

    // Feed current scroll offset back to virtual-core
    virtualizer.scrollOffset = scrollEl.scrollTop;
    virtualizer._willUpdate();
    virtualItems = virtualizer.getVirtualItems();
    totalSize = virtualizer.getTotalSize();

    triggerLoadIfNeeded();
  }

  function triggerLoadIfNeeded() {
    if (!virtualItems.length) return;

    const first = virtualItems[0];
    const last = virtualItems[virtualItems.length - 1];

    if (
      first.index < loadThreshold &&
      hasOlderMessages &&
      !isLoadingOlder &&
      !isLoadingNewer
    ) {
      handleLoadOlder();
    }

    if (
      last.index >= messages.length - 1 - loadThreshold &&
      hasNewerMessages &&
      !isLoadingNewer &&
      !isLoadingOlder
    ) {
      handleLoadNewer();
    }
  }

  // ─── Load handlers ────────────────────────────────────────────────
  async function handleLoadOlder() {
    if (!loadOlder || isLoadingOlder) return;
    isLoadingOlder = true;
    try {
      await loadOlder();
    } finally {
      isLoadingOlder = false;
    }
  }

  async function handleLoadNewer() {
    if (!loadNewer || isLoadingNewer) return;
    isLoadingNewer = true;
    try {
      await loadNewer();
    } finally {
      isLoadingNewer = false;
    }
  }

  // ─── Svelte action: measure real row height after render ──────────
  //     Handles dynamic content like images or expanding text.
  function measureRow(node: Element) {
    virtualizer?.measureElement(node);

    const ro = new ResizeObserver(() => {
      virtualizer?.measureElement(node);
    });
    ro.observe(node);

    return {
      destroy() {
        ro.disconnect();
      },
    };
  }

  // ─── Public API (access via bind:this on the component) ───────────
  export function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    scrollEl?.scrollTo({ top: scrollEl.scrollHeight, behavior });
  }

  export function scrollToIndex(
    index: number,
    options?: {
      align?: "start" | "center" | "end" | "auto";
      behavior?: ScrollBehavior;
    },
  ) {
    virtualizer?.scrollToIndex(index, options);
  }
</script>

<!-- ─── Markup ───────────────────────────────────────────────────── -->
<div class="vml-root {className}" bind:this={scrollEl} onscroll={handleScroll}>
  <!--
    Single inner div that is exactly `totalSize` px tall.
    Each row is absolutely positioned inside via translateY.
    This is the standard TanStack Virtual pattern.
  -->
  <div class="vml-inner" style="height: {totalSize}px;">
    <!-- Top loader — shown while fetching older messages -->
    {#if isLoadingOlder}
      <div
        class="vml-loader vml-loader--top"
        aria-label="Loading older messages"
      >
        {#if loaderSnippet}
          {@render loaderSnippet()}
        {:else}
          <div class="vml-dots" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Virtualised rows -->
    {#each virtualItems as vItem (vItem.key)}
      {@const msg = messages[vItem.index]}
      <div
        class="vml-row"
        data-index={vItem.index}
        style="transform: translateY({vItem.start}px);"
        use:measureRow
      >
        {@render messageSnippet(msg, vItem.index)}
      </div>
    {/each}

    <!-- Bottom loader — shown while fetching newer messages -->
    {#if isLoadingNewer}
      <div
        class="vml-loader vml-loader--bottom"
        aria-label="Loading newer messages"
      >
        {#if loaderSnippet}
          {@render loaderSnippet()}
        {:else}
          <div class="vml-dots" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  /* ── Scroll container ───────────────────────────────────────── */
  .vml-root {
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
    width: 100%;
    -webkit-overflow-scrolling: touch; /* momentum scroll on iOS */
    will-change: scroll-position;
    contain: strict; /* prevent layout bleed outside the component */
  }

  /* ── Height spacer ─────────────────────────────────────────── */
  .vml-inner {
    position: relative;
    width: 100%;
  }

  /* ── Each virtual row ──────────────────────────────────────── */
  .vml-row {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    box-sizing: border-box;
    /*
      DO NOT set a fixed height here.
      TanStack Virtual measures the real height via ResizeObserver.
    */
  }

  /* ── Loaders ───────────────────────────────────────────────── */
  .vml-loader {
    position: absolute;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 0;
    z-index: 10;
    pointer-events: none;
  }
  .vml-loader--top {
    top: 0;
  }
  .vml-loader--bottom {
    bottom: 0;
  }

  /* ── Default dot pulse animation ───────────────────────────── */
  .vml-dots {
    display: flex;
    gap: 5px;
    align-items: center;
  }
  .vml-dots span {
    display: block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.35;
    animation: vml-bounce 1.1s ease-in-out infinite;
  }
  .vml-dots span:nth-child(2) {
    animation-delay: 0.18s;
  }
  .vml-dots span:nth-child(3) {
    animation-delay: 0.36s;
  }

  @keyframes vml-bounce {
    0%,
    80%,
    100% {
      transform: scale(0.65);
      opacity: 0.25;
    }
    40% {
      transform: scale(1.1);
      opacity: 0.85;
    }
  }
</style>
