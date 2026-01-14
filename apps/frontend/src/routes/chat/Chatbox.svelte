<script lang="ts">
    import { chatStore } from "$lib/store.svelte";
    import ChatboxHeader from "./ChatboxHeader.svelte";
    import ChatInput from "./ChatInput.svelte";
    import { onMount, tick } from "svelte";
    import { Check, CheckCheck, Inspect } from "@lucide/svelte";

    const messages = $derived(
        chatStore.messages[chatStore.activeConversation?.conversation_id!],
    );

    let chatbox: HTMLUListElement | undefined = $state();

    function scrollToBottom() {
        if (chatbox) {
            chatbox.scrollTop = chatbox.scrollHeight;
        }
    }

    onMount(() => {
        console.log("mounted");
        scrollToBottom();
    });

    let isAtBottom = $state(true);
    // $inspect({ chatt: chatStore.rawMessages });
    // $inspect({ messages });

    $effect(() => {
        if (messages && Object.entries(messages).length > 0 && isAtBottom) {
            tick().then(() => scrollToBottom());
        }
    });

    $effect(() => {
        if (chatStore.flatMessages.length > 0) {
            oldestLoadedId = chatStore.flatMessages[0].message.message_id;

            newestLoadedId =
                chatStore.flatMessages[chatStore.flatMessages.length - 1]
                    .message.message_id;
        }
    });

    const conversation_id = $derived(
        chatStore.activeConversation?.conversation_id!,
    );
    const user_id = $derived(chatStore.currentUser?.id!);
    const MAX_MESSAGES_IN_MEMORY = 100;
    let scrollTop = $state(0);
    let isLoadingOlder = $state(false);
    let isLoadingNewer = $state(false);
    let hasMoreOlder = $state(true);
    let hasMoreNewer = $state(true);
    let oldestLoadedId = $state(0);
    let newestLoadedId = $state(0);

    async function loadOlderMessages() {
        if (isLoadingOlder || !hasMoreOlder || !oldestLoadedId) return;
        isLoadingOlder = true;

        try {
            const response = await fetch(
                `http://localhost:3000/api/conversations/${conversation_id}/messages/${user_id}?before=${oldestLoadedId}&limit=${20}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                },
            );

            const data = await response.json();
            if (data.chat.length > 0) {
                const previousScrollHeight = chatbox?.scrollHeight || 0;

                // Prepend older messages
                let newRawMessages = [...data.chat, ...chatStore.flatMessages];
                chatStore.buildNestedMap(newRawMessages);
                hasMoreOlder = data.hasMore;

                // Auto Unload
                if (newRawMessages.length > MAX_MESSAGES_IN_MEMORY) {
                    const excess =
                        newRawMessages.length - MAX_MESSAGES_IN_MEMORY;
                    newRawMessages = newRawMessages.slice(0, -excess);
                    chatStore.buildNestedMap(newRawMessages);
                    hasMoreNewer = true;
                    console.log({ newRawMessages });
                }
                await tick();
                if (chatbox) {
                    const newScrollHeight = chatbox.scrollHeight;
                    chatbox.scrollTop +=
                        newScrollHeight - previousScrollHeight + 200;
                }
            } else {
                hasMoreOlder = false;
            }
        } finally {
            isLoadingOlder = false;
        }
    }

    async function loadNewerMessages() {
        if (isLoadingNewer || !hasMoreNewer || !newestLoadedId) return;

        isLoadingNewer = true;

        try {
            const response = await fetch(
                `http://localhost:3000/api/conversations/${conversation_id}/messages/${user_id}?after=${newestLoadedId}&limit=${20}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                },
            );

            const data = await response.json();
            // Append new messages to the existing messages array
            if (data.chat.length > 0) {
                let newRawMessages = [...chatStore.flatMessages, ...data.chat];
                chatStore.buildNestedMap(newRawMessages);
                newestLoadedId =
                    data.chat[data.chat.length - 1].message.message_id;

                hasMoreNewer = data.hasMore;

                // Auto unloading if too many messages
                if (newRawMessages.length > MAX_MESSAGES_IN_MEMORY) {
                    const excess =
                        newRawMessages.length - MAX_MESSAGES_IN_MEMORY;
                    newRawMessages = newRawMessages.slice(excess);
                    chatStore.buildNestedMap(newRawMessages);
                    console.log({ newRawMessages });
                    hasMoreOlder = true;
                }
            } else {
                hasMoreNewer = false;
            }
        } finally {
            isLoadingNewer = false;
        }
    }

    async function handleScroll(event: Event) {
        const target = event.target as HTMLUListElement;
        scrollTop = target.scrollTop;

        isAtBottom =
            Math.abs(
                target.scrollHeight - target.scrollTop - target.clientHeight,
            ) < 5;

        if (scrollTop < 200 && hasMoreOlder) {
            console.log("Loading older messages...");
            await loadOlderMessages();
        }

        // Load newer messages when scrolling near bottom
        const scrollBottom =
            target.scrollHeight - target.scrollTop - target.clientHeight;
        if (scrollBottom < 200 && hasMoreNewer) {
            loadNewerMessages();
        }
    }
</script>

<div class="border-4 flex flex-col h-full overflow-y-auto">
    <ChatboxHeader />
    <ul
        bind:this={chatbox}
        class="flex flex-col gap-2 p-2 overflow-y-auto h-[calc(100%-40px)]"
        onscroll={(e) => handleScroll(e)}
    >
        {#each Object.entries(messages ?? {}) as [key, entry]}
            {@render messageItem(entry)}
        {/each}
    </ul>
    <ChatInput />
</div>

{#snippet messageItem(item: { message: any; receipt: any })}
    {#if item.message.sender_id !== chatStore.currentUser?.id}
        <li class="flex flex-col p-2 bg-gray-200 w-max px-3 rounded-sm">
            <span>{item.message.content}</span>
            <span class="text-xs">
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
        <li class="flex flex-col bg-gray-200 ml-auto p-2 px-3 rounded-sm">
            <span class="text-xl ml-auto font-bold"
                >{item.message.message_id}</span
            >
            <span>{item.message.content}</span>
            <span class="text-xs flex items-center justify-between gap-3">
                {new Date(item.message.created_at).toLocaleString([], {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                })}
                {#if item.receipt.status === "sent"}
                    <Check size={12} class=" rounded-full text-gray-500" />
                {:else if item.receipt.status === "delivered"}
                    <CheckCheck size={12} class=" rounded-full text-gray-500" />
                {:else if item.receipt.status === "read"}
                    <CheckCheck size={12} class=" rounded-full text-blue-500" />
                {/if}
            </span>
        </li>
    {/if}
{/snippet}
