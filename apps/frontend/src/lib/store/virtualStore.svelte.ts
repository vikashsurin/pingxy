import { chatStore, type ChatEntry } from "./store.svelte";
import { tick } from "svelte";

type ResponseData = { chat: ChatEntry[]; hasMore: boolean };

class VirtualStore {
  // Existing state
  absoluteLatestMessageId = $state<number>();
  isNotAtBottom = $state<boolean>();
  unreadCount = $state<number>();

  // Virtual scrolling state
  scrollTop = $state(0);
  viewportHeight = $state(0);
  totalHeight = $state(0);

  // Loading states
  isLoadingOlder = $state(false);
  isLoadingNewer = $state(false);
  hasMoreOlder = $state(false);
  hasMoreNewer = $state(false);

  // UX state
  jumpToLatest = $state(false);
  shouldScrollToBottom = $state(false);

  //Messages
  visibleList = $derived(
    chatStore.activeMessages
      .slice(this.getVisibleRange().start, this.getVisibleRange().end)
      .map((entry, idx) => ({
        entry,
        index: this.getVisibleRange().start + idx,
      })),
  );

  isAtBottom = $derived.by(() => {
    if (this.absoluteLatestMessageId && this.visibleList.length > 0) {
      if (
        this.absoluteLatestMessageId ===
        this.visibleList.at(-1)?.entry.message.messageId
      ) {
        return true;
      }
    }
    return false;
  });

  // Caching
  private heightCache = new Map<number, number>();
  offsetsCache = $state<number[]>([]);

  // Constants
  readonly ESTIMATED_HEIGHT = 80;
  readonly OVERSCAN = 3;

  // --- Height & Offset Calculations ---
  getItemHeight(id: number): number {
    return this.heightCache.get(id) ?? this.ESTIMATED_HEIGHT;
  }

  setItemHeight(id: number, height: number) {
    this.heightCache.set(id, height);
  }

  recalculateOffsets() {
    const messages = chatStore.activeMessages;

    if (messages.length === 0) {
      this.offsetsCache = [];
      this.totalHeight = 0;
      return;
    }

    const newOffsets: number[] = [];
    let currentOffset = 0;

    for (let i = 0; i < messages.length; i++) {
      newOffsets[i] = currentOffset;
      currentOffset += this.getItemHeight(messages[i].message.messageId);
    }

    this.offsetsCache = newOffsets;
    this.totalHeight = currentOffset;
  }

  // --- Binary Search for Visible Range ---
  findStartIndex(scrollTop: number): number {
    let left = 0;
    let right = this.offsetsCache.length - 1;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.offsetsCache[mid] < scrollTop) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    return Math.max(0, left - this.OVERSCAN);
  }

  findEndIndex(scrollBottom: number): number {
    let left = 0;
    let right = this.offsetsCache.length - 1;

    while (left < right) {
      const mid = Math.ceil((left + right) / 2);
      if (this.offsetsCache[mid] <= scrollBottom) {
        left = mid;
      } else {
        right = mid - 1;
      }
    }

    return Math.min(this.offsetsCache.length, right + this.OVERSCAN + 1);
  }

  // Calculate visible range
  getVisibleRange() {
    if (this.offsetsCache.length === 0) {
      return { start: 0, end: 0 };
    }

    const start = this.findStartIndex(this.scrollTop);
    const end = this.findEndIndex(this.scrollTop + this.viewportHeight);

    return { start, end };
  }

  // --- Scroll Management ---
  scrollToBottom(scrollElement: HTMLDivElement | undefined, smooth = false) {
    if (!scrollElement) return;

    requestAnimationFrame(() => {
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: "instant",
        });
      }
    });
  }

  // --- Data Loading ---
  async handleLoadOlder(params: {
    conversationId: number;
    userId: number;
    limit: number;
    scrollElement: HTMLDivElement | undefined;
    visibleRangeStart: number;
  }) {
    if (
      !this.hasMoreOlder ||
      this.isLoadingOlder ||
      !params.conversationId ||
      !params.userId
    ) {
      return;
    }

    this.isLoadingOlder = true;
    this.shouldScrollToBottom = false;
    // Capture anchor
    const anchorIndex = params.visibleRangeStart;
    const anchorMsg = chatStore.activeMessages[anchorIndex];
    const oldAnchorOffset = this.offsetsCache[anchorIndex] || 0;

    const oldestId = chatStore.getOldestMessageId(params.conversationId);

    try {
      const response = await fetch(
        `/api/conversations/${params.conversationId}/messages/${params.userId}?before=${oldestId}&limit=${params.limit}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: ResponseData = await response.json();
      this.hasMoreOlder = data.hasMore ?? false;
      this.hasMoreNewer = true;

      if (data.chat.length > 0) {
        chatStore.loadOlderMessages(
          params.conversationId,
          Array.from(data.chat),
        );

        await tick();

        // Restore scroll position
        if (anchorMsg && params.scrollElement) {
          const newAnchorIndex = chatStore.activeMessages.findIndex(
            (m) => m.message.messageId === anchorMsg.message.messageId,
          );

          if (newAnchorIndex !== -1) {
            const newAnchorOffset = this.offsetsCache[newAnchorIndex];
            const delta = newAnchorOffset - oldAnchorOffset;
            params.scrollElement.scrollTop += delta;
          }
        }
      }
    } catch (error) {
      console.error("Failed to load older messages:", error);
    } finally {
      this.isLoadingOlder = false;
    }
  }

  async handleLoadNewer(params: {
    conversationId: number;
    userId: number;
    limit: number;
    scrollElement: HTMLDivElement | undefined;
    visibleRangeStart: number;
  }) {
    if (
      !this.hasMoreNewer ||
      this.isLoadingNewer ||
      !params.conversationId ||
      !params.userId
    ) {
      return;
    }

    this.isLoadingNewer = true;

    const anchorIndex = params.visibleRangeStart;
    const anchorMsg = chatStore.activeMessages[anchorIndex];
    const oldAnchorOffset = this.offsetsCache[anchorIndex] || 0;

    const newestId = chatStore.getNewestMessageId(params.conversationId);

    try {
      const response = await fetch(
        `/api/conversations/${params.conversationId}/messages/${params.userId}?after=${newestId}&limit=${params.limit}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: ResponseData = await response.json();
      this.hasMoreNewer = data.hasMore ?? false;

      if (data.chat.length > 0) {
        chatStore.loadNewerMessages(
          params.conversationId,
          Array.from(data.chat),
        );

        await tick();

        if (anchorMsg && params.scrollElement) {
          const newAnchorIndex = chatStore.activeMessages.findIndex(
            (m) => m.message.messageId === anchorMsg.message.messageId,
          );

          if (newAnchorIndex !== -1) {
            const newAnchorOffset = this.offsetsCache[newAnchorIndex];
            const delta = newAnchorOffset - oldAnchorOffset;

            if (delta !== 0) {
              params.scrollElement.scrollTop += delta;
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to load newer messages:", error);
    } finally {
      this.isLoadingNewer = false;
    }
  }

  // --- Cache Management ---
  clearHeightCache() {
    this.heightCache.clear();
    this.recalculateOffsets();
  }

  cleanCacheForConversation(messageIds: Set<number>) {
    const newCache = new Map<number, number>();
    for (const [id, height] of this.heightCache.entries()) {
      if (messageIds.has(id)) {
        newCache.set(id, height);
      }
    }
    this.heightCache = newCache;
    this.recalculateOffsets();
  }

  // --- Reset ---
  reset() {
    this.scrollTop = 0;
    this.viewportHeight = 0;
    this.totalHeight = 0;
    this.isLoadingOlder = false;
    this.isLoadingNewer = false;
    this.hasMoreOlder = false;
    this.hasMoreNewer = false;
    this.jumpToLatest = false;
    this.heightCache.clear();
    this.offsetsCache = [];
  }
}

export const virtualStore = new VirtualStore();
