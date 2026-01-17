<script lang="ts">
    import { chatStore } from "$lib/store.svelte";
    import ChatboxHeader from "./ChatboxHeader.svelte";
    import ChatInput from "./ChatInput.svelte";
    import { onMount, tick } from "svelte";
    import { Check, CheckCheck } from "@lucide/svelte";
    import { Loader } from "@lucide/svelte";
    import type { ChatEntry } from "$lib/store.svelte";

    type ResponseData = { chat: ChatEntry[]; hasMore: boolean };

    const user_id = $derived(chatStore.currentUser?.id);
    const conversation_id = $derived(
        chatStore.activeConversation?.conversation_id,
    );

    // $inspect({ messages: chatStore.messages });
    // $inspect({ count: chatStore.activeMessages.length });

    // Indices will be used to determine the range of messages to load
    const indices = $derived.by(() => {
        if (chatStore.activeMessages && chatStore.activeMessages.length > 0) {
            return {
                oldest: chatStore.activeMessages[0].message.message_id,
                latest: chatStore.activeMessages[
                    chatStore.activeMessages.length - 1
                ].message.message_id,
            };
        }

        return {
            oldest: null,
            latest: null,
        };
    });

    onMount(() => {
        if (conversation_id) {
            chatStore.loadInitialMessages({
                conversation_id: conversation_id,
            });
        }
    });

    // --- Element State ---
    let scrollViewport: HTMLDivElement | undefined = $state();
    let scrollContent: HTMLDivElement | undefined = $state();

    // --- Intersection Observer  ---
    function intersectionObserver(node: HTMLElement, callback: () => void) {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    callback();
                }
            },
            {
                root: scrollViewport,
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
        if (!conversation_id || !user_id) {
            return;
        }
        try {
            const response = await fetch(
                `http://localhost:3000/api/conversations/${conversation_id}/messages/${user_id}?before=${indices.oldest}&limit=10`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                },
            );
            const data: ResponseData = await response.json();
            if (data.chat.length > 0) {
                let newMessages = [
                    ...Array.from(data.chat),
                    ...chatStore.activeMessages,
                ];
                if (newMessages.length > 50) {
                    console.log("newMessages.length > 200", newMessages.length);
                    newMessages = newMessages.slice(0, 50);
                    console.log(newMessages);
                    chatStore.updateConversationMessages(
                        conversation_id,
                        newMessages,
                    );
                } else {
                    chatStore.updateConversationMessages(
                        conversation_id,
                        newMessages,
                    );
                }
            }
        } finally {
        }
    }

    function handleScroll() {}
</script>

<div class="flex flex-col h-full overflow-hidden">
    <ChatboxHeader />

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
            <ul>
                {#each chatStore.activeMessages as entry}
                    {@render messageItem(entry)}
                {/each}
            </ul>
            <div
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
    <div class="absolute w-full flex justify-center items-center h-7.5">
        <span class="text-xs text-gray-400 py-1 px-2">
            Start of conversation
        </span>
    </div>
{/snippet}

<!-- Snippet: Message Item -->
{#snippet messageItem(item: ChatEntry)}
    {#if item.message.sender_id !== chatStore.currentUser?.id}
        <li data-message-id={item.message.message_id}>
            <div
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
        </li>
    {:else}
        <li data-message-id={item.message.message_id}>
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
        </li>
    {/if}
{/snippet}
