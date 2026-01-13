<script lang="ts">
    import { chatStore } from "$lib/store.svelte";
    import ChatboxHeader from "./ChatboxHeader.svelte";
    import ChatInput from "./ChatInput.svelte";
    import { onMount, tick } from "svelte";
    import { Check, CheckCheck, Inspect } from "@lucide/svelte";
    import { loadMessageOnScroll } from "$lib/storeHelper.svelte";

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
    $inspect({ chatt: chatStore.rawMessages });
    $inspect({ messages });

    $effect(() => {
        if (messages && Object.entries(messages).length > 0 && isAtBottom) {
            tick().then(() => scrollToBottom());
        }
    });

    let scrollTop = $state(0);
    let isLoadingOlder = $state(false);
    let isLoadingNewer = $state(false);
    let hasMoreOlder = $state(true);
    let oldestLoadedId = $state(0);
    let newestLoadedId = $state(0);
    $effect(() => {
        if (chatStore.flatMessages.length > 0) {
            oldestLoadedId = chatStore.flatMessages[0].message.message_id;
            newestLoadedId =
                chatStore.flatMessages[chatStore.flatMessages.length - 1]
                    ?.message.message_id;
        }
    });

    $inspect({ oldestLoadedId, newestLoadedId });

    async function loadOlderMessages() {
        const previousScrollHeight = chatbox?.scrollHeight || 0;
        isLoadingOlder = true;
        const hasMore = await loadMessageOnScroll({
            conversation_id: chatStore.activeConversation?.conversation_id!,
            before: oldestLoadedId,
            after: newestLoadedId,
            limit: 20,
        });
        console.log({ hasMore });
        hasMoreOlder = hasMore;
        await tick();
        if (chatbox) {
            const newScrollHeight = chatbox.scrollHeight;
            chatbox.scrollTop += newScrollHeight - previousScrollHeight;
            console.log("Scroll position updated", newScrollHeight);
        }
        isLoadingOlder = false;
    }

    async function handleScroll(event: Event) {
        const target = event.target as HTMLUListElement;
        scrollTop = target.scrollTop;

        isAtBottom =
            Math.abs(
                target.scrollHeight - target.scrollTop - target.clientHeight,
            ) < 5;

        if (scrollTop < 200 && hasMoreOlder && !isLoadingOlder) {
            isLoadingOlder = true;
            await loadOlderMessages();
        }
    }

    $inspect({ hasMoreOlder });
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
