<script lang="ts">
    import { messageStore } from "$lib/store/messageStore.svelte";
    import { formatLocalTime } from "$lib/utils/time";
    import { Check, CheckCheck } from "@lucide/svelte";
    import { type MessageReceipt } from "@pingxy/shared";
    import { tick } from "svelte";
    import { SvelteMap } from "svelte/reactivity";

    let { idValue, user } = $props();

    const messageIds = $derived.by(() => {
        return Array.from(messageStore.threads.get(idValue) || []).sort(
            (a, b) => a - b,
        );
    });

    const oldestMessageId = $derived(messageIds[0]);

    let messageListRef = $state<HTMLElement | undefined>();

    const interSectionObserver = (node: HTMLElement, callback: () => void) => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    callback();
                }
            },
            {
                rootMargin: "0px 0px 100px 0px",
            },
        );

        observer.observe(node);
        return {
            destroy() {
                observer.disconnect();
            },
        };
    };

    const measuredHeights = new SvelteMap<number, number>();
    const virtualOffset = new SvelteMap<number, number>();

    const totalVirtualHeight = $derived.by(() => {
        let h = 0;
        for (const [id, height] of measuredHeights) {
            h += height;
        }
        return h;
    });

    // $inspect({ measuredHeights });
    $inspect({ totalVirtualHeight });

    // let virtualOffset =
    // $inspect({ measuredHeights });

    function handleMeasure(id: number, height: number) {
        measuredHeights.set(id, height);
    }

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

    $effect(() => {
        if (!messageListRef) return;
        if (!messageIds) return;
        // messageListRef?.scrollTo({
        //     top: messageListRef.scrollHeight,
        //     behavior: "smooth",
        // });
    });

    let isLoadingOlder = $state(false);
    let isLoadingNewer = $state(false);

    let hasMoreOlder = $state(true);
    let scrollTop = $state(0);

    async function loadOlder() {
        isLoadingOlder = true;

        // const scrollHeightBefore = messageListRef?.scrollHeight;
        // console.log("before height", messageListRef?.scrollHeight);
        const anchorEl = messageListRef?.querySelector(".message");
        const anchorTop = anchorEl?.getBoundingClientRect().top ?? 0;

        const result = await messageStore.fetchOlderMessages({
            conversationId: idValue,
            userId: user.id,
            oldestId: oldestMessageId,
            limit: 30,
        });

        if (result) {
            if (!result.hasMore) {
                hasMoreOlder = false;
            }
            console.log({ items: result });
            result.items.forEach((item: any) => {
                messageStore.upsertMessage(item);
            });
        }
        await tick();
        isLoadingOlder = false;
        // const scrollHeightAfter = messageListRef?.scrollHeight;
        // const heightDiff = scrollHeightAfter! - scrollHeightBefore!;
        // console.log("after height", messageListRef?.scrollHeight);
        // if (messageListRef) {
        //     messageListRef.scrollTop += heightDiff!;
        // }
        if (anchorEl && messageListRef) {
            const newAnchorTop = anchorEl.getBoundingClientRect().top;
            const drift = newAnchorTop - anchorTop;
            messageListRef.scrollTop += drift;
        }
        console.log("loading older");
    }

    function loadNewer() {
        console.log("loading newer");
    }
</script>

<div bind:this={messageListRef} class="flex-1 overflow-y-auto min-h-0">
    {#if isLoadingOlder}
        <div class="flex bg-gray-300 items-center justify-center">
            loading older messages...
        </div>
    {/if}
    {#if !hasMoreOlder}
        <div class="flex bg-gray-300 items-center justify-center">
            start of conversation
        </div>
    {:else}
        <div
            class="bg-amber-400 h-0"
            use:interSectionObserver={loadOlder}
        ></div>
    {/if}
    {#each messageIds as id (id)}
        {@const entry = messageStore.messages.get(id)}
        {#if entry}
            <div
                use:measureHeight={{ id, onMeasure: handleMeasure }}
                class="message flex"
            >
                {#if entry.message.senderId === user.id}
                    <div
                        class="bg-blue-100 flex flex-col justify-end border max-w-1/2 ml-auto px-2 py-1"
                    >
                        <span class="font-xl font-bold"
                            >{entry.message.messageId}</span
                        >
                        <span id={entry.message.messageId.toString()}
                            >{entry.message.content}</span
                        >
                        <span
                            id="meta-data"
                            class="flex justify-between items-end gap-2"
                        >
                            <span class="text-xs opacity-60"
                                >{formatLocalTime(
                                    entry.message.createdAt,
                                )}</span
                            >
                            {@render receipt(entry.receipt)}
                        </span>
                    </div>
                {:else}
                    <div
                        class="bg-gray-300 flex flex-col justify-start border max-w-1/2 px-2 py-1"
                    >
                        <span
                            id={entry.message.messageId.toString()}
                            class="sender">{entry.message.content}</span
                        >
                        <span
                            id="meta-data"
                            class="flex justify-start items-start gap-2"
                        >
                            <span class="text-xs opacity-60">
                                {formatLocalTime(entry.message.createdAt)}</span
                            >
                        </span>
                    </div>
                {/if}
            </div>
        {/if}
    {/each}
    <div class="bg-amber-400" use:interSectionObserver={loadNewer}>bottom</div>
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
