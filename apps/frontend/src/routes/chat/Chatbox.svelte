<script lang="ts">
    import { chatStore } from "$lib/store.svelte";
    import ChatboxHeader from "./ChatboxHeader.svelte";
    import ChatInput from "./ChatInput.svelte";
    import { onMount, tick } from "svelte";
    import { Check, CheckCheck } from "@lucide/svelte";

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
        scrollToBottom();
    });

    $effect(() => {
        if (messages && Object.entries(messages).length > 0) {
            tick().then(() => scrollToBottom());
        }
    });
</script>

<div class="border-4 flex flex-col h-full overflow-y-auto">
    <ChatboxHeader />
    <ul
        bind:this={chatbox}
        class="flex flex-col gap-2 p-2 overflow-y-auto h-[calc(100%-40px)]"
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
