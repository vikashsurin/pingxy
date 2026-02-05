<script lang="ts">
    import { chatStore } from "$lib/store/store.svelte.js";
    import { onMount, tick } from "svelte";
    import {
        Check,
        CheckCheck,
        BellRing,
        CircleArrowDown,
        Loader,
    } from "@lucide/svelte";
    import { Tween } from "svelte/motion";
    import type { ChatEntry } from "$lib/store/store.svelte.js";
    import { virtualStore } from "$lib/store/virtualStore.svelte.js";
    import * as receiptManager from "$lib/store/managers/receipt.svelte";
    import { date } from "zod/v3";

    const LIMIT = $derived(chatStore.LIMIT);

    const userId = $derived(chatStore.currentUser?.id);
    const conversationId = $derived(
        chatStore.activeConversation?.conversationId,
    );
    let unread = $derived(
        chatStore.unread.get(
            chatStore.activeConversation?.conversationId ?? 0,
        ),
    );

    // --- DOM Elements ---
    let scrollElement: HTMLDivElement | undefined = $state();

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
                        const oldHeight = virtualStore.getItemHeight(id);

                        if (oldHeight !== newHeight) {
                            virtualStore.setItemHeight(id, newHeight);
                            needsRecalc = true;
                        }
                    }
                }

                if (needsRecalc) {
                    virtualStore.recalculateOffsets();
                }
            });
        }
        return resizeObserver;
    }
    // Calculate visible items using virtualStore
    let visibleRange = $derived.by(() => virtualStore.getVisibleRange());

    // --- Measurement ---
    function measure(node: HTMLElement, id: number) {
        const ob = getObserver();
        elementToId.set(node, id);
        ob.observe(node);

        // Initial measure
        const initialHeight = node.offsetHeight;
        const cachedHeight = virtualStore.getItemHeight(id);

        if (cachedHeight === virtualStore.ESTIMATED_HEIGHT) {
            virtualStore.setItemHeight(id, initialHeight);
            virtualStore.recalculateOffsets();
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
            virtualStore.scrollTop = scrollElement.scrollTop;
        }
    }

    // --- Effects ---

    // Recalculate when messages change
    let lastMessageCount = 0;
    $effect(() => {
        const currentCount = chatStore.activeMessages.length;
        if (currentCount !== lastMessageCount) {
            lastMessageCount = currentCount;
            virtualStore.recalculateOffsets();
        }
    });

    // Clean cache when conversation changes
    $effect(() => {
        const convId = conversationId;

        if (convId) {
            const currentIds = new Set(
                chatStore.activeMessages.map((m) => m.message.messageId),
            );

            virtualStore.cleanCacheForConversation(currentIds);
        }
    });

    // --- Lifecycle ---
    onMount(() => {
        virtualStore.shouldScrollToBottom = true;
        if (conversationId) {
            chatStore.loadInitialMessages({ conversationId });
        }
        virtualStore.hasMoreOlder = true;

        if (scrollElement) {
            virtualStore.viewportHeight = scrollElement.clientHeight;
        }

        return () => {
            resizeObserver?.disconnect();
            elementToId.clear();
        };
    });

    $effect(() => {
        if (
            virtualStore.shouldScrollToBottom &&
            chatStore.activeMessages.length > 0
        ) {
            scrollElement?.scrollBy({
                top: virtualStore.totalHeight,
                behavior: "instant",
            });
        }
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

    // --- Data Loading Wrappers ---
    async function handleLoadOlder() {
        if (!conversationId || !userId) return;

        await virtualStore.handleLoadOlder({
            conversationId,
            userId,
            limit: LIMIT,
            scrollElement,
            visibleRangeStart: visibleRange.start,
        });
    }

    async function handleLoadNewer() {
        if (!conversationId || !userId) return;

        await virtualStore.handleLoadNewer({
            conversationId,
            userId,
            limit: LIMIT,
            scrollElement,
            visibleRangeStart: visibleRange.start,
        });
    }
    // Jump to latest effect
    $effect(() => {
        if (virtualStore.visibleList) {
            const currentLastId =
                virtualStore.visibleList.at(-1)?.entry.message.messageId;
            if (currentLastId && virtualStore.absoluteLatestMessageId) {
                if (
                    currentLastId <
                    virtualStore.absoluteLatestMessageId - 250
                ) {
                    virtualStore.jumpToLatest = true;
                } else {
                    virtualStore.jumpToLatest = false;
                }
            }
        }
    });

    function handleJumpToLatest() {
        virtualStore.shouldScrollToBottom = true;
        if (virtualStore.jumpToLatest && scrollElement) {
            chatStore.loadInitialMessages({
                conversationId: conversationId!,
            });

            scrollElement.scrollTo({
                top: virtualStore.totalHeight,
                behavior: "instant",
            });
        }
    }

    async function handleNewMessage() {
        virtualStore.shouldScrollToBottom = true;
        if (scrollElement) {
            chatStore.loadInitialMessages({
                conversationId: conversationId!,
            });

            scrollElement.scrollTo({
                top: virtualStore.totalHeight,
                behavior: "instant",
            });
        }
        await receiptManager.emitMarkAllRead({
            conversationId: conversationId!,
            currentuserId: chatStore.currentUser?.id!,
            recipientId: chatStore.activeConversation?.user.id!,
        });
        chatStore.unread.delete(conversationId!);
    }
</script>

<div style:height="100%" class="overflow-auto relative">
    <div
        bind:this={scrollElement}
        bind:clientHeight={virtualStore.viewportHeight}
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

        <ul style:height="{virtualStore.totalHeight}px" class="relative w-full">
            {#if virtualStore.isLoadingOlder}
                {@render oldLoader()}
            {/if}

            {#if !virtualStore.hasMoreOlder}
                {@render startOfConversation()}
            {/if}

            {#each virtualStore.visibleList as { entry, index } (entry.message.messageId)}
                <li
                    use:measure={entry.message.messageId}
                    style:width="100%"
                    style:transform="translateY({virtualStore.offsetsCache[
                        index
                    ]}px)"
                    class="absolute left-0 top-0 py-2"
                >
                    {@render messageItem(entry)}
                </li>
            {/each}

            {#if virtualStore.isLoadingNewer}
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

    {#if virtualStore.jumpToLatest && !chatStore.unread.has(conversationId!)}
        <button
            class="absolute z-50 bottom-10 right-1/2 translate-x-1/2"
            onclick={handleJumpToLatest}
        >
            <div
                class="bg-blue-500 flex hover:bg-blue-400 active:bg-blue-600 items-center gap-1 justify-center text-white active:scale-98 p-2 text-xs font-medium rounded-full"
            >
                <CircleArrowDown size={16} strokeWidth={2} />
                Jump to Latest
            </div>
        </button>
    {/if}

    {#if chatStore.unread.has(conversationId!)}
        <button
            class="absolute z-50 bottom-10 right-1/2 translate-x-1/2"
            onclick={handleNewMessage}
        >
            <div
                class="bg-blue-500 flex hover:bg-blue-400 active:bg-blue-600 items-center gap-1 justify-center text-white active:scale-98 p-2 text-xs font-medium rounded-full"
            >
                <BellRing
                    size={16}
                    strokeWidth={2}
                    class="animate-wiggle-alert"
                />
                New Message
            </div>
        </button>
    {/if}
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
    {#if item.message.senderId !== chatStore.currentUser?.id}
        <div
            class="flex flex-col p-2 bg-gray-200 w-max max-w-[70%] px-3 rounded-lg list-none"
        >
            <div class="flex flex-col">
                <span class="font-bold text-xl">{item.message.messageId}</span>
                <span data-attr-msg class="whitespace-pre-wrap"
                    >{item.message.content}</span
                >
                <span data-attr-date class="text-xs text-gray-600 mt-1">
                    {new Date(item.message.createdAt).toLocaleString([], {
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
                <span class="font-bold text-xl">{item.message.messageId}</span>
                <span data-attr-msg class="whitespace-pre-wrap"
                    >{item.message.content}</span
                >
                <span
                    class="text-xs flex items-center justify-end gap-2 opacity-90 mt-1"
                >
                    <span data-attr-date>
                        {new Date(item.message.createdAt).toLocaleString([], {
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
