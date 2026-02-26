<!--
  +page.svelte — Example usage of VirtualMessageList
  Shows bi-directional loading with your chatStore pattern.
-->
<script lang="ts">
    import VirtualMessageList from "./VirtualMessageList.svelte";
    import { chatStore } from "$lib/store/store.svelte";

    let { data } = $props();

    // ── Derive the message array for the current conversation ────────
    // Object.values gives us an array; sort by timestamp for correct order.
    let messages = $derived(
        Object.values(chatStore.messages[data.idValue] ?? {}).sort(
            (a, b) => a.message.createdAt - b.message.createdAt,
        ),
    );

    // ── Pagination cursors ────────────────────────────────────────────
    let oldestCursor = $state<string | null>(
        data.messages.meta?.oldestCursor ?? null,
    );
    let newestCursor = $state<string | null>(
        data.messages.meta?.newestCursor ?? null,
    );
    let hasOlder = $state(data.messages.meta?.hasOlder ?? false);
    let hasNewer = $state(data.messages.meta?.hasNewer ?? false);

    // ── Reference to the component for programmatic scroll ───────────
    let listRef = $state<ReturnType<typeof VirtualMessageList> | null>(null);

    // ── Load older messages (scroll up) ──────────────────────────────
    async function loadOlder() {
        if (!oldestCursor) return;

        const res = await fetch(
            `/api/conversations/${params.conversationId}/messages/${params.userId}?before=${oldestId}&limit=${params.limit}`,
        );
        const json = await res.json();

        // Merge into store (single reactive update)
        const incoming = json.data.messages.items as Array<any>;
        const updates = Object.fromEntries(
            incoming.map((item) => [item.message.messageId, item]),
        );
        chatStore.messages[data.idValue] = {
            ...updates,
            ...chatStore.messages[data.idValue],
        };

        oldestCursor = json.data.messages.meta?.oldestCursor ?? null;
        hasOlder = json.data.messages.meta?.hasOlder ?? false;
    }

    // ── Load newer messages (scroll down) ────────────────────────────
    async function loadNewer() {
        if (!newestCursor) return;

        const res = await fetch(
            `/chat/${data.idValue}/__data.json?cursor=${newestCursor}&direction=newer`,
        );
        const json = await res.json();

        const incoming = json.data.messages.items as Array<any>;
        const updates = Object.fromEntries(
            incoming.map((item) => [item.message.messageId, item]),
        );
        chatStore.messages[data.idValue] = {
            ...chatStore.messages[data.idValue],
            ...updates,
        };

        newestCursor = json.data.messages.meta?.newestCursor ?? null;
        hasNewer = json.data.messages.meta?.hasNewer ?? false;
    }

    // ── Scroll to latest on demand ────────────────────────────────────
    function jumpToBottom() {
        listRef?.scrollToBottom();
    }
</script>

<div class="chat-layout">
    <VirtualMessageList
        bind:this={listRef}
        {messages}
        getItemKey={(msg) => msg.message.messageId}
        estimateSize={(msg) => {
            // Give a rough estimate based on content length for less layout shift
            const charCount = msg.message.content?.length ?? 0;
            return Math.max(
                60,
                Math.min(400, 60 + Math.floor(charCount / 60) * 22),
            );
        }}
        hasOlderMessages={hasOlder}
        hasNewerMessages={hasNewer}
        {loadOlder}
        {loadNewer}
        stickToBottom={true}
        overscan={6}
        loadThreshold={4}
        class="chat-scroll-area"
    >
        {#snippet message(msg, index)}
            {#if msg.message.status === "sent"}
                <div class="message sent">
                    <div class="message-content">{msg.message.content}</div>
                    <span class="message-time"
                        >{new Date(
                            msg.message.timestamp,
                        ).toLocaleTimeString()}</span
                    >
                </div>
            {:else}
                <div class="message received">
                    <div class="message-content">{msg.message.content}</div>
                    <span class="message-time"
                        >{new Date(
                            msg.message.timestamp,
                        ).toLocaleTimeString()}</span
                    >
                </div>
            {/if}
        {/snippet}

        <!-- Optional: custom loader -->
        {#snippet loader()}
            <div class="my-loader">Loading…</div>
        {/snippet}
    </VirtualMessageList>

    <button class="jump-btn" onclick={jumpToBottom}>↓ Latest</button>
</div>

<style>
    .chat-layout {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100vh;
    }

    /* VirtualMessageList needs a bounded height container */
    :global(.chat-scroll-area) {
        flex: 1;
        min-height: 0;
    }

    .message {
        display: flex;
        flex-direction: column;
        padding: 8px 16px;
        gap: 2px;
    }

    .message.sent {
        align-items: flex-end;
    }

    .message.received {
        align-items: flex-start;
    }

    .message-content {
        max-width: 70%;
        padding: 8px 12px;
        border-radius: 16px;
        background: #e5e5ea;
        word-break: break-word;
        white-space: pre-wrap;
    }

    .sent .message-content {
        background: #007aff;
        color: white;
    }

    .message-time {
        font-size: 11px;
        opacity: 0.5;
        padding: 0 4px;
    }

    .my-loader {
        font-size: 12px;
        opacity: 0.5;
    }

    .jump-btn {
        position: absolute;
        bottom: 80px;
        right: 16px;
        background: #007aff;
        color: white;
        border: none;
        border-radius: 20px;
        padding: 8px 14px;
        cursor: pointer;
        font-size: 13px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
</style>
