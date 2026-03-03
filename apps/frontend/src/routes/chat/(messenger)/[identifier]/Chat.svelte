<script lang="ts">
    import { messageStore } from "$lib/store/messageStore.svelte";
    import { formatLocalTime } from "$lib/utils/time";
    import { Check, CheckCheck } from "@lucide/svelte";
    import { type MessageReceipt } from "@pingxy/shared";
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
            result.items.forEach((item: any) => {
                messageStore.upsertMessage(item);
            });
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
            result.items.forEach((item: any) => {
                messageStore.upsertMessage(item);
            });
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
                    scrollTop + containerHeight >=
                    totalVirtualHeight - threshold;

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
                class="flex bg-gray-300 items-center justify-center absolute top-0 w-full"
            >
                start of conversation
            </div>
        {:else}
            <div
                class="bg-amber-400 h-0 absolute top-0 w-full"
                use:interSectionObserver={loadOlder}
            ></div>
        {/if}

        <!-- only visible messages are in the DOM, absolutely positioned -->
        {#each visibleMessageIds as id (id)}
            {@const entry = messageStore.messages.get(id)}
            {#if entry}
                <div
                    use:measureHeight={{ id, onMeasure: handleMeasure }}
                    class="message flex absolute w-full"
                    style="top: {virtualOffsets.get(id) ?? 0}px"
                >
                    {#if entry.message.senderId === user.id}
                        <div
                            class="bg-blue-100 flex flex-col justify-end border max-w-1/2 ml-auto px-2 py-1"
                        >
                            <span class="font-xl font-bold">
                                {entry.message.messageId}
                            </span>
                            <span id={entry.message.messageId.toString()}>
                                {entry.message.content}
                            </span>
                            <span
                                id="meta-data"
                                class="flex justify-between items-end gap-2"
                            >
                                <span class="text-xs opacity-60">
                                    {formatLocalTime(entry.message.createdAt)}
                                </span>
                                {@render receipt(entry.receipt)}
                            </span>
                        </div>
                    {:else}
                        <div
                            class="bg-gray-300 flex flex-col justify-start border max-w-1/2 px-2 py-1"
                        >
                            <span
                                id={entry.message.messageId.toString()}
                                class="sender"
                            >
                                {entry.message.content}
                            </span>
                            <span
                                id="meta-data"
                                class="flex justify-start items-start gap-2"
                            >
                                <span class="text-xs opacity-60">
                                    {formatLocalTime(entry.message.createdAt)}
                                </span>
                            </span>
                        </div>
                    {/if}
                </div>
            {/if}
        {/each}

        <!-- load newer sentinel: sits at the very bottom of the spacer -->
        <div
            class="bg-amber-400 absolute bottom-0 w-full h-0"
            use:interSectionObserver={loadNewer}
        ></div>
    </div>
</div>

{#snippet receipt(receipt: MessageReceipt)}
    {#if receipt.status === "sent"}
        <Check size={14} />
    {:else if receipt.status === "delivered"}
        <CheckCheck size={14} />
    {:else if receipt.status === "read"}
        <CheckCheck size={14} class="text-blue-500" />
    {/if}
{/snippet}
