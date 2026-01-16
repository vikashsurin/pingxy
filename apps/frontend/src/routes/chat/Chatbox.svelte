<script lang="ts">
    import { chatStore } from "$lib/store.svelte";
    import ChatboxHeader from "./ChatboxHeader.svelte";
    import ChatInput from "./ChatInput.svelte";
    import { onMount, tick } from "svelte";
    import { Check, CheckCheck } from "@lucide/svelte";
    import { Loader } from "@lucide/svelte";
    import type { ChatEntry } from "$lib/store.svelte";

    // --- Message State ---

    // --- Derived State ---

    // // Get messages for current conversation ONLY
    // const messagesMap = $derived(
    //     conversation_id ? chatStore.messages[conversation_id] || {} : {},
    // );
    // console.log("messageMap", messagesMap);

    // const sortedMessages = $derived(
    //     Object.values(messagesMap).sort((a, b) => {
    //         const dateA = new Date(a.message.created_at).getTime();
    //         const dateB = new Date(b.message.created_at).getTime();
    //         return dateA - dateB;
    //     }),
    // );

    const conversation_id = $derived(
        chatStore.activeConversation?.conversation_id,
    );
    const user_id = $derived(chatStore.currentUser?.id);

    const messageMap = $derived(chatStore.messages[conversation_id!]);

    const sortedMessages = $derived(() => {
        if (!messageMap) return [];
        return Object.values(messageMap).sort((a, b) => {
            const dateA = new Date(a.message.created_at).getTime();
            const dateB = new Date(b.message.created_at).getTime();
            return dateA - dateB;
        });
    });

    $inspect({ messages: sortedMessages().length });

    onMount(() => {
        chatStore.loadInitialMessages({
            conversation_id: conversation_id!,
        });
        scrollContainerHeight = scrollContent?.scrollHeight ?? 0;
        scrollTop = scrollViewport?.scrollTop ?? 0;
    });

    // --- Element State ---
    let scrollViewport: HTMLDivElement | undefined = $state();
    let scrollContent: HTMLDivElement | undefined = $state();
    let scrollContainerHeight = $state();
    let scrollTop = $state();

    let rowHeight = $state(65);
    let buffer = $state(3);

    let firstIndexId = $state(0);
    let lastIndexId = $state(0);
    $inspect({ firstIndexId, lastIndexId, scrollContainerHeight });

    let hasMoreOlder = $state(true);
    let hasMoreNewer = $state(true);

    // let startNode = Math.floor(scrollTop / rowHeight) - buffer;
    // startNode = Math.max(0, startNode);

    // let visibleNodesCount =
    //     Math.ceil(scrollContainerHeight / rowHeight) + 2 * buffer;
    // visibleNodesCount = Math.min(
    //     sortedMessages().length - startNode,
    //     visibleNodesCount,
    // );

    let offsetY = $state();

    $effect(() => {
        if (sortedMessages().length > 0) {
            firstIndexId = sortedMessages()[0].message.message_id;
            lastIndexId =
                sortedMessages()[sortedMessages().length - 1].message
                    .message_id;
        }
    });

    function test() {
        if (scrollContent) scrollContent.scrollTop = 100;
        console.log("erst");
    }

    function scrollToBottom() {
        if (scrollContent) {
            scrollContent.scrollTop = scrollContent.scrollHeight;
        }
    }

    onMount(() => {
        scrollToBottom();
    });

    $effect(() => {
        if (sortedMessages().length > 0) {
            // tick().then(() => scrollToBottom());
        }
    });

    // --- Intersection Observer  ---
    function intersectionObserver(node: HTMLElement, callback: () => void) {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    callback();
                }
            },
            {
                root: scrollContent,
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

    async function handleLoadOlder() {
        if (!conversation_id || !user_id) return;

        const response = await fetch(
            `http://localhost:3000/api/conversations/${conversation_id}/messages/${user_id}?before=${firstIndexId}&limit=50`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            },
        );
        const data: { chat: ChatEntry[]; hasMore: boolean } =
            await response.json();
        hasMoreOlder = data.hasMore;
        if (data.chat.length > 0) {
            let newMessages = [...data.chat, ...sortedMessages()];
            if (newMessages.length > 200) {
                const excess = newMessages.length - 200;
                newMessages.splice(excess);
            }
            chatStore.updateConversationMessages(conversation_id, newMessages);
        }
    }

    function handleScroll() {
        scrollContainerHeight = scrollContent?.scrollHeight ?? 0;
    }
</script>

<div class="flex flex-col h-full overflow-hidden">
    <ChatboxHeader />

    <button onclick={test}>test</button>
    <div
        bind:this={scrollViewport}
        data-virtual-list-viewport
        class="relative flex-1 overflow-hidden border-4"
    >
        <div
            bind:this={scrollContent}
            data-virtual-list-content
            class="h-full overflow-y-auto w-full p-2"
            onscroll={handleScroll}
        >
            <div
                use:intersectionObserver={handleLoadOlder}
                data-infinite-scroll-trigger="older"
                class="h-1 w-full bg-amber-500"
                aria-hidden="true"
            ></div>
            <ul class="h-[500px]">
                {#each sortedMessages() as entry (entry.message.message_id)}
                    {@render messageItem(entry)}
                {/each}
            </ul>
            <div
                use:intersectionObserver={() => console.log("newer")}
                data-infinite-scroll-trigger="newer"
                class="h-1 w-full bg-amber-500"
                aria-hidden="true"
            ></div>
        </div>
    </div>

    <ChatInput />
</div>

<!--  Snippets -->

{#snippet oldLoader()}
    <div
        class="absolute top-0 w-full flex justify-center items-center h-[30px] z-10"
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
        class="absolute bottom-0 w-full text-center py-2 h-[40px] flex items-center justify-center text-amber-500 z-10"
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
    <div
        class="absolute top-[-30px] w-full flex justify-center items-center h-[30px]"
    >
        <span class="text-xs text-gray-400 py-1 px-2">
            Start of conversation
        </span>
    </div>
{/snippet}

<!-- Snippet: Message Item -->
{#snippet messageItem(item: ChatEntry)}
    {#if item.message.sender_id !== chatStore.currentUser?.id}
        <li
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
        </li>
    {:else}
        <div
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
