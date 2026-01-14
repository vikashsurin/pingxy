<script lang="ts">
    import { chatStore } from "$lib/store.svelte";
    import ChatboxHeader from "./ChatboxHeader.svelte";
    import ChatInput from "./ChatInput.svelte";
    import { onMount, tick } from "svelte";
    import { Check, CheckCheck } from "@lucide/svelte";
    import { Loader } from "@lucide/svelte";
    import type { ChatEntry } from "$lib/store.svelte";

    // --- Derived State ---
    const conversation_id = $derived(
        chatStore.activeConversation?.conversation_id ?? null,
    );
    const user_id = $derived(chatStore.currentUser?.id ?? null);

    // Get messages for current conversation ONLY
    const messagesMap = $derived(
        conversation_id ? chatStore.messages[conversation_id] || {} : {},
    );

    const sortedMessages = $derived(
        Object.values(messagesMap).sort((a, b) => {
            const dateA = new Date(a.message.created_at).getTime();
            const dateB = new Date(b.message.created_at).getTime();
            return dateA - dateB;
        }),
    );

    // --- State ---
    let chatbox = $state<HTMLDivElement>();
    let scrollTop = $state(0);
    let containerHeight = $state(600);

    // Pagination State
    const MAX_MESSAGES_IN_MEMORY = 200;
    let isLoadingOlder = $state(false);
    let isLoadingNewer = $state(false);
    let hasMoreOlder = $state(true);
    let hasMoreNewer = $state(false);

    let oldestLoadedId = $state<number | null>(null);
    let newestLoadedId = $state<number | null>(null);

    // Track previous message count for scroll restoration
    let previousMessageCount = $state(0);
    let shouldRestoreScroll = $state(false);
    let scrollRestoreHeight = $state(0);
    let scrollRestoreTop = $state(0);

    // Store for actual measured heights
    let measuredHeights = $state<Map<number, number>>(new Map());
    let messageElements = new Map<number, HTMLElement>();

    // IntersectionObserver for measuring visible items
    let observer: IntersectionObserver | null = null;

    // --- Virtualization with measured heights ---
    function getMessageHeight(entry: ChatEntry): number {
        const msgId = entry.message.message_id;

        // Use measured height if available
        if (measuredHeights.has(msgId)) {
            return measuredHeights.get(msgId)!;
        }

        // Fallback to estimation
        const baseHeight = 70; // Increased padding + margins
        const text = entry.message.content || "";

        // Better estimation based on message length and line breaks
        const hasLineBreaks = text.includes("\n");
        const charCount = text.length;

        if (hasLineBreaks) {
            const lines = text.split("\n").length;
            return baseHeight + lines * 24;
        }

        // Estimate based on character count with better wrapping calculation
        // Assume ~60 chars per line for user messages (narrower), ~80 for received
        const isUserMessage =
            entry.message.sender_id === chatStore.currentUser?.id;
        const charsPerLine = isUserMessage ? 45 : 60;
        const estimatedLines = Math.ceil(charCount / charsPerLine);

        return baseHeight + Math.max(1, estimatedLines) * 24;
    }

    let itemOffsets = $derived.by(() => {
        let acc = 0;
        const offsets = [0];
        for (const msg of sortedMessages) {
            acc += getMessageHeight(msg);
            offsets.push(acc);
        }
        return offsets;
    });

    let totalHeight = $derived(itemOffsets[itemOffsets.length - 1] || 0);

    // Reduce buffer size to prevent over-rendering
    const RENDER_BUFFER = 300;

    let visibleStartIndex = $derived.by(() => {
        const target = Math.max(0, scrollTop - RENDER_BUFFER);

        let low = 0,
            high = itemOffsets.length - 1;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (itemOffsets[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return Math.max(0, low - 1);
    });

    let visibleEndIndex = $derived.by(() => {
        const target = scrollTop + containerHeight + RENDER_BUFFER;

        let low = 0,
            high = itemOffsets.length - 1;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (itemOffsets[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return Math.min(sortedMessages.length, low);
    });

    let visibleMessages = $derived(
        sortedMessages.slice(visibleStartIndex, visibleEndIndex),
    );

    let offsetY = $derived(itemOffsets[visibleStartIndex] || 0);

    // --- Measure rendered elements ---
    function measureElement(element: HTMLElement, messageId: number) {
        if (!element) return;

        const height = element.offsetHeight;
        if (height > 0 && height !== measuredHeights.get(messageId)) {
            measuredHeights.set(messageId, height);
            // Trigger recalculation
            measuredHeights = new Map(measuredHeights);
        }
    }

    // Setup IntersectionObserver to measure visible items
    $effect(() => {
        if (!chatbox) return;

        // Recreate observer when chatbox changes
        observer?.disconnect();

        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const element = entry.target as HTMLElement;
                        const messageId = parseInt(
                            element.dataset.messageId || "0",
                        );
                        if (messageId) {
                            measureElement(element, messageId);
                        }
                    }
                });
            },
            {
                root: chatbox,
                rootMargin: "100px",
                threshold: 0,
            },
        );

        for (const [messageId, element] of messageElements) {
            observer.observe(element);
        }

        return () => {
            observer?.disconnect();
        };
    });

    // Register elements with observer
    function registerElement(element: HTMLElement, messageId: number) {
        if (!element) return;

        messageElements.set(messageId, element);
        element.dataset.messageId = messageId.toString();
        if (observer) {
            observer.observe(element);
        }

        // Measure immediately
        measureElement(element, messageId);

        return {
            destroy() {
                if (observer) {
                    observer.unobserve(element);
                }
                messageElements.delete(messageId);
            },
        };
    }

    // --- Logic ---

    // Track boundaries for pagination
    $effect(() => {
        if (sortedMessages.length > 0) {
            oldestLoadedId = sortedMessages[0].message.message_id;
            newestLoadedId =
                sortedMessages[sortedMessages.length - 1].message.message_id;
        }
    });

    // Reset pagination and scroll state when conversation changes
    $effect(() => {
        const id = conversation_id;

        if (!id) {
            return;
        }

        isLoadingOlder = false;
        isLoadingNewer = false;
        hasMoreOlder = true;
        hasMoreNewer = false;
        measuredHeights = new Map();
        scrollTop = 0;
        previousMessageCount = 0;
        shouldRestoreScroll = false;
        scrollRestoreHeight = 0;
        scrollRestoreTop = 0;

        if (chatbox) {
            chatbox.scrollTop = chatbox.scrollHeight;
        }
    });

    function scrollToBottom() {
        if (chatbox) {
            chatbox.scrollTop = chatbox.scrollHeight;
        }
    }

    // Initial load
    onMount(() => {
        if (sortedMessages.length > 0) {
            tick().then(scrollToBottom);
        }
    });

    // Handle auto-scroll for new messages
    let wasAtBottom = false;

    $effect.pre(() => {
        if (chatbox) {
            const threshold = 50;
            wasAtBottom =
                chatbox.scrollHeight -
                    chatbox.scrollTop -
                    chatbox.clientHeight <=
                threshold;
        }
    });

    // Auto-scroll when new messages arrive
    $effect(() => {
        const currentCount = sortedMessages.length;

        if (
            currentCount > previousMessageCount &&
            wasAtBottom &&
            !isLoadingOlder
        ) {
            tick().then(scrollToBottom);
        }

        previousMessageCount = currentCount;
    });

    // Restore scroll position after loading older messages
    $effect(() => {
        if (shouldRestoreScroll && chatbox) {
            const newTotalHeight = chatbox.scrollHeight;
            const heightDifference = newTotalHeight - scrollRestoreHeight;

            if (heightDifference > 0) {
                chatbox.scrollTop = scrollRestoreTop + heightDifference;
            }

            shouldRestoreScroll = false;
        }
    });

    let scrollTimeout: number | null = null;

    async function handleScroll(e: Event) {
        const target = e.target as HTMLDivElement;
        scrollTop = target.scrollTop;

        // Debounce pagination triggers
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }

        scrollTimeout = window.setTimeout(() => {
            // Load Older - trigger earlier for smoother UX
            if (scrollTop < 400 && hasMoreOlder && !isLoadingOlder) {
                loadOlderMessages();
            }

            // Load Newer
            const scrollBottom =
                target.scrollHeight - target.scrollTop - target.clientHeight;
            if (scrollBottom < 400 && hasMoreNewer && !isLoadingNewer) {
                loadNewerMessages();
            }
        }, 100);
    }

    async function loadOlderMessages() {
        if (
            isLoadingOlder ||
            !hasMoreOlder ||
            !oldestLoadedId ||
            !chatbox ||
            !conversation_id ||
            !user_id
        )
            return;

        isLoadingOlder = true;

        // Capture scroll state BEFORE fetch
        scrollRestoreHeight = chatbox.scrollHeight;
        scrollRestoreTop = chatbox.scrollTop;

        try {
            const response = await fetch(
                `http://localhost:3000/api/conversations/${conversation_id}/messages/${user_id}?before=${oldestLoadedId}&limit=20`,
                { credentials: "include" },
            );

            if (!response.ok) {
                throw new Error("Failed to load older messages");
            }

            const data = await response.json();

            if (data.chat && data.chat.length > 0) {
                const existingMessages = Object.values(messagesMap);
                let newAllMessages = [...data.chat, ...existingMessages];

                // Memory Management
                if (newAllMessages.length > MAX_MESSAGES_IN_MEMORY) {
                    const excess =
                        newAllMessages.length - MAX_MESSAGES_IN_MEMORY;
                    newAllMessages = newAllMessages.slice(0, -excess);
                    hasMoreNewer = true;
                }

                hasMoreOlder = data.hasMore ?? false;

                chatStore.updateConversationMessages(
                    conversation_id,
                    newAllMessages,
                );

                shouldRestoreScroll = true;

                await tick();
            } else {
                hasMoreOlder = false;
            }
        } catch (error) {
            console.error("Error loading older messages:", error);
        } finally {
            setTimeout(() => {
                isLoadingOlder = false;
            }, 150);
        }
    }

    async function loadNewerMessages() {
        if (
            isLoadingNewer ||
            !hasMoreNewer ||
            !newestLoadedId ||
            !conversation_id ||
            !user_id
        )
            return;

        isLoadingNewer = true;

        try {
            const response = await fetch(
                `http://localhost:3000/api/conversations/${conversation_id}/messages/${user_id}?after=${newestLoadedId}&limit=20`,
                { credentials: "include" },
            );

            if (!response.ok) {
                throw new Error("Failed to load newer messages");
            }

            const data = await response.json();

            if (data.chat && data.chat.length > 0) {
                const existingMessages = Object.values(messagesMap);
                let newAllMessages = [...existingMessages, ...data.chat];

                if (newAllMessages.length > MAX_MESSAGES_IN_MEMORY) {
                    const excess =
                        newAllMessages.length - MAX_MESSAGES_IN_MEMORY;
                    newAllMessages = newAllMessages.slice(excess);
                    hasMoreOlder = true;
                }

                hasMoreNewer = data.hasMore ?? false;
                chatStore.updateConversationMessages(
                    conversation_id,
                    newAllMessages,
                );

                await tick();
            } else {
                hasMoreNewer = false;
            }
        } catch (error) {
            console.error("Error loading newer messages:", error);
        } finally {
            setTimeout(() => {
                isLoadingNewer = false;
            }, 150);
        }
    }
</script>

<div class="flex flex-col h-full overflow-hidden">
    <ChatboxHeader />

    <div
        class="relative flex-1 overflow-hidden"
        bind:clientHeight={containerHeight}
    >
        <div
            bind:this={chatbox}
            class="h-full overflow-y-auto w-full p-2"
            onscroll={handleScroll}
        >
            <div
                style="height: {totalHeight}px; position: relative; width: 100%;"
            >
                {#if isLoadingOlder}
                    <div class="w-full flex justify-center items-center">
                        <span
                            class="flex gap-1 items-center text-xs bg-gray-100 text-gray-400 py-1 px-2 rounded"
                        >
                            <Loader size={12} class="animate-spin" />
                            Loading older messages...
                        </span>
                    </div>
                {/if}

                {#if !hasMoreOlder}
                    <div class="w-full flex justify-center items-center">
                        <span
                            class="text-xs bg-gray-100 text-gray-400 py-1 px-2 rounded"
                        >
                            Beginning of the conversation
                        </span>
                    </div>
                {/if}

                <div
                    style="position:relative; top: 0; left: 0; right: 0; transform: translateY({offsetY}px); will-change: transform;"
                >
                    {#each visibleMessages as entry (entry.message.message_id)}
                        {@render messageItem(entry)}
                    {/each}
                </div>

                {#if isLoadingNewer}
                    <div
                        class="absolute bottom-0 w-full text-center py-2 text-xs text-amber-500 z-10 bg-gray-600"
                    >
                        Loading newer messages...
                    </div>
                {/if}
            </div>
        </div>
    </div>

    <ChatInput />
</div>

{#snippet messageItem(item: ChatEntry)}
    {#if item.message.sender_id !== chatStore.currentUser?.id}
        <div
            use:registerElement={item.message.message_id}
            class="flex flex-col p-2 bg-gray-200 w-max max-w-[70%] px-3 rounded-lg mb-2 list-none"
        >
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
    {:else}
        <div
            use:registerElement={item.message.message_id}
            class="flex flex-col bg-gray-500 text-white ml-auto p-2 px-3 rounded-lg mb-2 list-none w-max max-w-[70%]"
        >
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
    {/if}
{/snippet}
