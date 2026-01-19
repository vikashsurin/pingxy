<script lang="ts">
    import { chatStore } from "$lib/store.svelte";
    import { onMount, tick } from "svelte";
    import { Check, CheckCheck, Loader } from "@lucide/svelte";
    import type { ChatEntry } from "$lib/store.svelte";

    type ResponseData = { chat: ChatEntry[]; hasMore: boolean };

    const LIMIT = $derived(chatStore.LIMIT);
    const ESTIMATED_HEIGHT = 80;
    const OVERSCAN = 3;

    const user_id = $derived(chatStore.currentUser?.id);
    const conversation_id = $derived(
        chatStore.activeConversation?.conversation_id,
    );

    // --- State ---
    let scrollElement: HTMLDivElement | undefined = $state();
    let scrollTop = $state(0);
    let viewportHeight = $state(0);

    let isLoadingOlder = $state(false);
    let isLoadingNewer = $state(false);
    let hasMoreOlder = $state(false);
    let hasMoreNewer = $state(false);

    // Simple Map for heights
    let heightCache = new Map<number, number>();
    let offsetsCache: number[] = $state([]);
    let totalHeight = $state(0);

    // --- ResizeObserver ---
    let resizeObserver: ResizeObserver;
    const elementToId = new Map<HTMLElement, number>();

    function getObserver() {
        if (!resizeObserver) {
            resizeObserver = new ResizeObserver((entries) => {
                let needsRecalc = false;

                for (const entry of entries) {
                    const id = elementToId.get(entry.target as HTMLElement);
                    if (id !== undefined) {
                        const newHeight = (entry.target as HTMLElement)
                            .offsetHeight;
                        const oldHeight = heightCache.get(id);

                        if (oldHeight !== newHeight) {
                            heightCache.set(id, newHeight);
                            needsRecalc = true;
                        }
                    }
                }

                if (needsRecalc) {
                    recalculateOffsets();
                }
            });
        }
        return resizeObserver;
    }

    // --- Height & Offset Calculations ---
    function getItemHeight(id: number): number {
        return heightCache.get(id) ?? ESTIMATED_HEIGHT;
    }

    function recalculateOffsets() {
        const messages = chatStore.activeMessages;

        if (messages.length === 0) {
            offsetsCache = [];
            totalHeight = 0;
            return;
        }

        const newOffsets: number[] = [];
        let currentOffset = 0;

        for (let i = 0; i < messages.length; i++) {
            newOffsets[i] = currentOffset;
            currentOffset += getItemHeight(messages[i].message.message_id);
        }

        offsetsCache = newOffsets;
        totalHeight = currentOffset;
    }

    // --- Binary Search for Visible Range ---
    function findStartIndex(scrollTop: number): number {
        let left = 0;
        let right = offsetsCache.length - 1;

        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (offsetsCache[mid] < scrollTop) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        return Math.max(0, left - OVERSCAN);
    }

    function findEndIndex(scrollBottom: number): number {
        let left = 0;
        let right = offsetsCache.length - 1;

        while (left < right) {
            const mid = Math.ceil((left + right) / 2);
            if (offsetsCache[mid] <= scrollBottom) {
                left = mid;
            } else {
                right = mid - 1;
            }
        }

        return Math.min(offsetsCache.length, right + OVERSCAN + 1);
    }

    // Calculate visible items
    let visibleRange = $derived.by(() => {
        if (offsetsCache.length === 0) {
            return { start: 0, end: 0 };
        }

        const start = findStartIndex(scrollTop);
        const end = findEndIndex(scrollTop + viewportHeight);

        return { start, end };
    });

    let visibleList = $derived(
        chatStore.activeMessages
            .slice(visibleRange.start, visibleRange.end)
            .map((entry, idx) => ({
                entry,
                index: visibleRange.start + idx,
            })),
    );

    // --- Measurement ---
    function measure(node: HTMLElement, id: number) {
        const ob = getObserver();
        elementToId.set(node, id);
        ob.observe(node);

        // Initial measure
        const initialHeight = node.offsetHeight;
        if (!heightCache.has(id)) {
            heightCache.set(id, initialHeight);
            recalculateOffsets();
        }

        return {
            destroy: () => {
                ob.unobserve(node);
                elementToId.delete(node);
            },
        };
    }

    // --- Scroll Handler ---
    function handleScroll() {
        if (scrollElement) {
            scrollTop = scrollElement.scrollTop;
        }
    }

    // --- Effects ---

    // Recalculate when messages change
    let lastMessageCount = 0;
    $effect(() => {
        const currentCount = chatStore.activeMessages.length;
        if (currentCount !== lastMessageCount) {
            lastMessageCount = currentCount;
            recalculateOffsets();
        }
    });

    // Clean cache when conversation changes
    $effect(() => {
        const convId = conversation_id;

        if (convId) {
            const currentIds = new Set(
                chatStore.activeMessages.map((m) => m.message.message_id),
            );

            const newCache = new Map<number, number>();
            for (const [id, height] of heightCache.entries()) {
                if (currentIds.has(id)) {
                    newCache.set(id, height);
                }
            }
            heightCache = newCache;
            recalculateOffsets();
        }
    });

    // --- Lifecycle ---
    onMount(() => {
        if (conversation_id) {
            chatStore.loadInitialMessages({ conversation_id });
        }
        hasMoreOlder = true;

        if (scrollElement) {
            viewportHeight = scrollElement.clientHeight;
        }

        return () => {
            resizeObserver?.disconnect();
            elementToId.clear();
        };
    });

    // --- Intersection Observer ---
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

    // --- Data Loading ---
    async function handleLoadOlder() {
        if (!hasMoreOlder || isLoadingOlder || !conversation_id || !user_id) {
            return;
        }

        isLoadingOlder = true;

        // Capture anchor
        const anchorIndex = visibleRange.start;
        const anchorMsg = chatStore.activeMessages[anchorIndex];
        const oldAnchorOffset = offsetsCache[anchorIndex] || 0;

        const oldestId = chatStore.getOldestMessageId(conversation_id);

        try {
            const response = await fetch(
                `http://localhost:3000/api/conversations/${conversation_id}/messages/${user_id}?before=${oldestId}&limit=${LIMIT}`,
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
            hasMoreOlder = data.hasMore ?? false;
            hasMoreNewer = true;

            if (data.chat.length > 0) {
                chatStore.loadOlderMessages(
                    conversation_id,
                    Array.from(data.chat),
                );

                await tick();
                await tick();

                // Restore scroll position
                if (anchorMsg && scrollElement) {
                    const newAnchorIndex = chatStore.activeMessages.findIndex(
                        (m) =>
                            m.message.message_id ===
                            anchorMsg.message.message_id,
                    );

                    if (newAnchorIndex !== -1) {
                        const newAnchorOffset = offsetsCache[newAnchorIndex];
                        const delta = newAnchorOffset - oldAnchorOffset;
                        scrollElement.scrollTop += delta;
                    }
                }
            }
        } catch (error) {
            console.error("Failed to load older messages:", error);
        } finally {
            isLoadingOlder = false;
        }
    }

    async function handleLoadNewer() {
        if (!hasMoreNewer || isLoadingNewer || !conversation_id || !user_id) {
            return;
        }

        isLoadingNewer = true;

        const anchorIndex = visibleRange.start;
        const anchorMsg = chatStore.activeMessages[anchorIndex];
        const oldAnchorOffset = offsetsCache[anchorIndex] || 0;

        const newestId = chatStore.getNewestMessageId(conversation_id);

        try {
            const response = await fetch(
                `http://localhost:3000/api/conversations/${conversation_id}/messages/${user_id}?after=${newestId}&limit=${LIMIT}`,
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
            hasMoreNewer = data.hasMore ?? false;

            if (data.chat.length > 0) {
                chatStore.loadNewerMessages(
                    conversation_id,
                    Array.from(data.chat),
                );

                await tick();
                await tick();

                if (anchorMsg && scrollElement) {
                    const newAnchorIndex = chatStore.activeMessages.findIndex(
                        (m) =>
                            m.message.message_id ===
                            anchorMsg.message.message_id,
                    );

                    if (newAnchorIndex !== -1) {
                        const newAnchorOffset = offsetsCache[newAnchorIndex];
                        const delta = newAnchorOffset - oldAnchorOffset;

                        if (delta !== 0) {
                            scrollElement.scrollTop += delta;
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Failed to load newer messages:", error);
        } finally {
            isLoadingNewer = false;
        }
    }
</script>

<div
    bind:this={scrollElement}
    bind:clientHeight={viewportHeight}
    data-virtual-list
    style:height="100%"
    class="flex-1 overflow-auto border-4"
    onscroll={handleScroll}
>
    <div
        use:intersectionObserver={handleLoadOlder}
        data-infinite-scroll-trigger="older"
        class="h-1 w-full"
        aria-hidden="true"
    ></div>

    <ul style:height="{totalHeight}px" class="relative w-full">
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
                style:transform="translateY({offsetsCache[index]}px)"
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
            <div class="flex flex-col">
                <span class="font-bold text-xl">{item.message.message_id}</span>
                <span data-attr-msg class="whitespace-pre-wrap"
                    >{item.message.content}</span
                >
                <span data-attr-date class="text-xs text-gray-600 mt-1">
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
            class="flex flex-col bg-gray-700 text-white ml-auto p-2 px-3 rounded-lg list-none w-max max-w-[70%]"
        >
            <div class="flex flex-col">
                <span class="font-bold text-xl">{item.message.message_id}</span>
                <span data-attr-msg class="whitespace-pre-wrap"
                    >{item.message.content}</span
                >
                <span
                    class="text-xs flex items-center justify-end gap-2 opacity-90 mt-1"
                >
                    <span data-attr-date>
                        {new Date(item.message.created_at).toLocaleString([], {
                            day: "numeric",
                            month: "short",
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true,
                        })}
                    </span>
                    <span data-attr-tick>
                        {#if item.receipt.status === "sent"}
                            <Check size={14} />
                        {:else if item.receipt.status === "delivered"}
                            <CheckCheck size={14} />
                        {:else if item.receipt.status === "read"}
                            <CheckCheck size={14} class="text-sky-400" />
                        {/if}
                    </span>
                </span>
            </div>
        </div>
    {/if}
{/snippet}
