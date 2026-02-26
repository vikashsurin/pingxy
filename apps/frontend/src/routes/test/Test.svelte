<script lang="ts">
    import { tick, onMount } from "svelte";

    type ChatEntry = {
        id: string;
        text: string;
        user: string;
        height?: number;
        timestamp: number;
    };

    // --- STATE ---
    let messageArray = $state<ChatEntry[]>([]);
    const messageIndex = new Map<string, ChatEntry>();

    let container: HTMLElement | undefined = $state();
    let scrollTop = $state(0);
    let viewportHeight = $state(0);

    const ESTIMATED_HEIGHT = 80;
    const BUFFER = 10; // Increased buffer helps stability during fast scrolls

    // --- DERIVED PHYSICS ---
    // Calculate the top position of every single message
    let offsets = $derived.by(() => {
        let current = 0;
        return messageArray.map((item) => {
            const top = current;
            current += item.height ?? ESTIMATED_HEIGHT;
            return top;
        });
    });

    // The total scrollable height
    let totalHeight = $derived(
        messageArray.length > 0
            ? offsets[offsets.length - 1] +
                  (messageArray[messageArray.length - 1].height ??
                      ESTIMATED_HEIGHT)
            : 0,
    );

    // The sliding window of what to render
    let visibleRange = $derived.by(() => {
        if (messageArray.length === 0) return { start: 0, end: 0 };

        let start = 0;
        // Find first visible item
        for (let i = 0; i < offsets.length; i++) {
            const bottom =
                offsets[i] + (messageArray[i].height ?? ESTIMATED_HEIGHT);
            if (bottom > scrollTop) {
                start = Math.max(0, i - BUFFER);
                break;
            }
        }

        let end = messageArray.length;
        // Find last visible item
        for (let i = start; i < offsets.length; i++) {
            if (offsets[i] > scrollTop + viewportHeight) {
                end = Math.min(messageArray.length, i + BUFFER);
                break;
            }
        }
        return { start, end };
    });

    // --- LOGIC ---

    async function addNewMessage(text: string, user = "Me") {
        const isAtBottom =
            container &&
            container.scrollHeight -
                container.scrollTop -
                container.clientHeight <
                50;

        const msg: ChatEntry = {
            id: crypto.randomUUID(),
            text,
            user,
            timestamp: Date.now(),
        };
        messageArray.push(msg);
        messageIndex.set(msg.id, messageArray[messageArray.length - 1]);

        if (user === "Me" || isAtBottom) {
            await tick();
            container?.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth",
            });
        }
    }

    async function loadHistory() {
        if (!container || messageArray.length === 0) return;

        // 1. Capture Anchor (what is currently at the top of the viewport)
        const firstVisibleIdx = messageArray.findIndex(
            (_, i) => offsets[i] >= container!.scrollTop,
        );
        const anchorItem = messageArray[firstVisibleIdx];
        const anchorOffsetDist = offsets[firstVisibleIdx] - container.scrollTop;

        // 2. Fake Data
        const olderMsgs: ChatEntry[] = Array.from({ length: 15 }).map(
            (_, i) => ({
                id: crypto.randomUUID(),
                user: "History",
                text:
                    i % 3 === 0
                        ? "Short history msg."
                        : "A much longer historical message to test if the dynamic height measurement and scroll anchoring work correctly together.",
                timestamp: Date.now() - 100000,
            }),
        );

        // 3. Update State
        messageArray = [...olderMsgs, ...messageArray];
        olderMsgs.forEach((m) => messageIndex.set(m.id, m));

        // 4. Critical: Wait for Svelte to calculate new offsets
        await tick();

        // 5. Re-anchor scroll position
        const newAnchorIdx = messageArray.findIndex(
            (m) => m.id === anchorItem.id,
        );
        container.scrollTop = offsets[newAnchorIdx] - anchorOffsetDist;

        // 6. Force sync the reactive scrollTop so visibleRange updates immediately
        scrollTop = container.scrollTop;
    }

    function measure(node: HTMLElement, id: string) {
        const observer = new ResizeObserver(() => {
            const { height } = node.getBoundingClientRect();
            const item = messageIndex.get(id);
            if (item && item.height !== height) {
                item.height = height;
            }
        });
        observer.observe(node);
        return { destroy: () => observer.disconnect() };
    }

    onMount(() => {
        for (let i = 0; i < 25; i++)
            addNewMessage("Pre-loaded message " + i, "Bot");
    });
</script>

<div class="h-screen bg-gray-900 flex flex-col p-4 font-sans text-white">
    <div
        class="max-w-3xl w-full mx-auto flex-1 flex flex-col bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-2xl relative"
    >
        <header
            class="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800 z-20"
        >
            <span class="font-bold">Chat Thread ({messageArray.length})</span>
            <button
                onclick={loadHistory}
                class="text-xs bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-colors"
            >
                Load Older
            </button>
        </header>

        <div
            bind:this={container}
            bind:offsetHeight={viewportHeight}
            onscroll={(e) => (scrollTop = e.currentTarget.scrollTop)}
            class="flex-1 overflow-y-auto relative"
        >
            <div class="relative w-full" style:height="{totalHeight}px">
                {#each messageArray.slice(visibleRange.start, visibleRange.end) as msg (msg.id)}
                    {@const idx = messageArray.indexOf(msg)}
                    <div
                        use:measure={msg.id}
                        class="absolute top-0 left-0 w-full p-2"
                        style:transform="translateY({offsets[idx]}px)"
                        style:opacity={msg.height ? 1 : 0}
                    >
                        <div
                            class="max-w-[85%] px-4 py-3 rounded-xl {msg.user ===
                            'Me'
                                ? 'bg-indigo-600 ml-auto'
                                : 'bg-gray-700 mr-auto'}"
                        >
                            <div
                                class="flex justify-between items-center mb-1 opacity-50 text-[10px] font-bold uppercase tracking-widest"
                            >
                                <span>{msg.user}</span>
                            </div>
                            <p class="text-sm">{msg.text}</p>
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <footer class="p-4 bg-gray-800 border-t border-gray-700 flex gap-2">
            <input
                type="text"
                placeholder="Write a message..."
                class="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 outline-none focus:border-indigo-500"
                onkeydown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                        addNewMessage(e.currentTarget.value);
                        e.currentTarget.value = "";
                    }
                }}
            />
        </footer>
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
    }
    div {
        will-change: transform;
    }
</style>
