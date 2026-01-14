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

    // Anchor Scroll State
    let anchorMessageId = $state<number | null>(null);
    let anchorOffset = $state(0);
    let isRestoringScroll = $state(false);

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

    // Helper to get offset of a specific message ID
    function getMessageOffset(id: number): number {
        const index = sortedMessages.findIndex(
            (m) => m.message.message_id === id,
        );
        if (index === -1) return 0;
        return itemOffsets[index];
    }

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
    let pendingMeasurements = new Map<number, number>();
    let batchFrame: number | null = null;

    function applyMeasurements() {
        if (pendingMeasurements.size === 0) return;

        // Apply all pending updates at once
        let changed = false;
        for (const [id, height] of pendingMeasurements) {
            if (measuredHeights.get(id) !== height) {
                measuredHeights.set(id, height);
                changed = true;
            }
        }

        if (changed) {
            measuredHeights = new Map(measuredHeights);
        }

        pendingMeasurements.clear();
        batchFrame = null;
    }

    function measureElement(element: HTMLElement, messageId: number) {
        if (!element) return;

        const height = element.offsetHeight;
        if (height > 0 && height !== measuredHeights.get(messageId)) {
            pendingMeasurements.set(messageId, height);

            if (!batchFrame) {
                batchFrame = requestAnimationFrame(applyMeasurements);
            }
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
    let isProgrammaticScroll = $state(false);

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
        anchorMessageId = null;
        isRestoringScroll = false;
        isProgrammaticScroll = false;

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

    // --- AUTO SCROLL LOGIC ---
    let wasAtBottom = $state(false);

    // Check if we are at bottom BEFORE updates
    function checkBottomStatus() {
        if (chatbox) {
            const threshold = 100; // lenient threshold
            wasAtBottom =
                chatbox.scrollHeight -
                    chatbox.scrollTop -
                    chatbox.clientHeight <=
                threshold;
        }
    }

    // Run this check often to keep state fresh
    $effect(() => {
        // We can hook into scroll events or just check periodically via effect if dependencies change
        // Actually, best to just check right inside the update routine
    });

    // Auto-scroll when new messages arrive (Sticky Bottom)
    $effect(() => {
        const currentCount = sortedMessages.length;

        // This effect runs whenever sortedMessages changes.
        // We want to scroll to bottom IF:
        // 1. We were already at the bottom before this update (Stickiness)
        // 2. OR this is a brand new message from ME (User expectation)
        // 3. AND we are NOT currently loading older history (which adds items to top)

        if (currentCount > previousMessageCount) {
            const lastMsg = sortedMessages[sortedMessages.length - 1];
            const isMyMessage = lastMsg.message.sender_id === user_id;

            // If I sent it, always scroll. If I was at bottom, keep me there.
            if (
                (wasAtBottom || isMyMessage) &&
                !isLoadingOlder &&
                !isRestoringScroll
            ) {
                tick().then(() => {
                    scrollToBottom();
                    // Re-check after scrolling to ensure we are "officially" at bottom for next time
                    // But wait for layout
                    setTimeout(checkBottomStatus, 50);
                });
            }
        }

        previousMessageCount = currentCount;
    });

    // We need to update `wasAtBottom` on scroll
    // Hook this into handleScroll
    function updateStickiness() {
        checkBottomStatus();
    }

    // --- ANCHOR SCROLLING LOGIC ---
    // Restore scroll position based on anchor message
    $effect(() => {
        // Dependency on itemOffsets ensures this runs when heights change
        const _ = itemOffsets;

        if (chatbox && anchorMessageId !== null) {
            // Find where the anchor message is now
            const newAnchorTop = getMessageOffset(anchorMessageId);
            const targetScroll = newAnchorTop - anchorOffset;

            // Only update if difference is significant
            if (Math.abs(chatbox.scrollTop - targetScroll) > 1) {
                isProgrammaticScroll = true;
                chatbox.scrollTop = targetScroll;

                // Reset flag after a microtask
                tick().then(() => {
                    isProgrammaticScroll = false;
                });
            }

            // Cleanup timeout
            if (isRestoringScroll) {
                isRestoringScroll = false;
                setTimeout(() => {
                    // Only clear if user hasn't taken over
                    if (!isProgrammaticScroll) {
                        anchorMessageId = null;
                    }
                }, 500);
            }
        }
    });

    let scrollTimeout: number | null = null;

    // Find the first visible message to use as anchor
    function findScrollAnchor() {
        if (!chatbox) return;

        const viewTop = chatbox.scrollTop;
        let index = visibleStartIndex;

        while (index < sortedMessages.length) {
            const top = itemOffsets[index];
            const bottom = itemOffsets[index + 1];

            if (bottom > viewTop) {
                anchorMessageId = sortedMessages[index].message.message_id;
                anchorOffset = top - viewTop;
                return;
            }
            index++;
        }

        anchorMessageId = null;
    }

    async function handleScroll(e: Event) {
        if (isProgrammaticScroll) return;

        const target = e.target as HTMLDivElement;

        // Update our "sticky" status
        checkBottomStatus();

        // If user scrolls manually, release the anchor immediately
        // BUT give a small buffer for the very first scroll event
        if (!isRestoringScroll) {
            anchorMessageId = null;
        }

        scrollTop = target.scrollTop;

        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }

        // Don't trigger fetches while restoring scroll
        if (isRestoringScroll) return;

        scrollTimeout = window.setTimeout(() => {
            // Load Older
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

        // Capture ANCHOR state BEFORE fetch
        findScrollAnchor();

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

                isRestoringScroll = true;

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

                // --- CHAINING CHECK ---
                // After loading, check if we need to load MORE immediately.
                if (chatbox && hasMoreNewer) {
                    const scrollBottom =
                        chatbox.scrollHeight -
                        chatbox.scrollTop -
                        chatbox.clientHeight;
                    // Strict check: Only chain if user is literally AT the bottom
                    if (scrollBottom < 100) {
                        setTimeout(() => {
                            // Double check status before firing
                            if (!isLoadingNewer && hasMoreNewer) {
                                loadNewerMessages();
                            }
                        }, 100); // 100ms delay to allow user to stop scrolling
                    }
                }
            } else {
                hasMoreNewer = false;
            }
        } catch (error) {
            console.error("Error loading newer messages:", error);
        } finally {
            setTimeout(() => {
                isLoadingNewer = false;
            }, 100);
        }
    }
</script>

<div class="flex flex-col h-full overflow-hidden">
    <ChatboxHeader />

    <div
        class="relative flex-1 overflow-hidden"
        bind:clientHeight={containerHeight}
    >
        <!-- sentinel top (removed) -->
        <div
            bind:this={chatbox}
            class="h-full overflow-y-auto w-full p-2"
            style="overflow-anchor: none;"
            onscroll={handleScroll}
        >
            <div
                style="height: {totalHeight}px; position: relative; width: 100%;"
            >
                {#if isLoadingOlder}
                    <div
                        class="w-full absolute top-0 flex justify-center items-center"
                    >
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
