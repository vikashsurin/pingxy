<script lang="ts">
    import { getSocket } from "$lib/socket.svelte";
    import { chatStore, type PrivateConversation } from "$lib/store.svelte";
    import type { MessagePayload } from "@chat/shared/src/lib/utils/validation";
    import { onMount } from "svelte";
    import GenderIcon from "./GenderIcon.svelte";
    import { markAllAsRead } from "$lib/storeHelper.svelte";

    onMount(async () => {
        const response = await fetch(
            "http://localhost:3000/api/conversations",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            },
        );
        const data = await response.json();
        chatStore.conversations = data.conversations;
    });

    const handleClick = async (conversation: PrivateConversation) => {
        chatStore.clearNotification(conversation.conversation_id!);
        chatStore.activeConversation = conversation;

        await markAllAsRead(conversation.user.id);
        // Load messages for current conversation
        // await chatStore.loadMessages();
        await chatStore.initialMessages({
            conversation_id: conversation.conversation_id,
        });

        const user_id = chatStore.currentUser?.id;

        // Subscribe to current Conversation
        const socket = getSocket();
        if (socket && socket.readyState === WebSocket.OPEN) {
            const messagePayload: MessagePayload = {
                id: crypto.randomUUID(),
                type: "open_conversation",
                data: {
                    conversation_id: conversation.conversation_id,
                    user_id: user_id,
                },
            };
            socket.send(JSON.stringify(messagePayload));
        }
    };
</script>

<div class="flex-1 flex flex-col overflow-hidden">
    <ul class=" overflow-y-auto w-full">
        {#if chatStore.conversations.length < 0}
            {@render userItemRowSkeleton()}
        {:else}
            {#each chatStore.conversations as conversation}
                {@render userItemRow(conversation)}
            {/each}
        {/if}
    </ul>
</div>

{#snippet userItemRowSkeleton()}
    <li>
        <div class="p-3 flex flex-col gap-2">
            <div class="bg-gray-300 h-6 w-1/2 rounded-xs animate-pulse"></div>
            <div class="bg-gray-200 h-6 w-1/1 rounded-xs animate-pulse"></div>
            <div class="bg-gray-100 h-6 w-full rounded-xs animate-pulse"></div>
            <div class="bg-gray-50 h-6 w-full rounded-xs animate-pulse"></div>
        </div>
    </li>
{/snippet}

{#snippet userItemRow(conversation: PrivateConversation)}
    <li>
        <div class="flex items-center gap-1 w-full relative group">
            <button
                class="px-2 py-1 w-full hover:bg-gray-300 relative flex gap-1 border-gray-200 {conversation.conversation_id ===
                chatStore.activeConversation?.conversation_id
                    ? 'bg-gray-400'
                    : ''}"
                id={conversation.user.id.toString()}
                onmouseenter={async () => {
                    // TODO optimize it
                    // await chatStore.preloadMessages({
                    //     conversation_id: conversation.conversation_id,
                    // });
                }}
                onclick={async () => {
                    handleClick(conversation);
                }}
            >
                <div class="flex items-center gap-2 w-full overflow-hidden">
                    <GenderIcon gender={conversation.user.data.gender} />
                    <span class="truncate">
                        {#if conversation.user.id === chatStore.currentUser?.id}
                            You
                        {:else}
                            {conversation.user.username}
                        {/if}
                    </span>

                    {#if conversation.user.data.country && conversation.user.data.country !== "0"}
                        <span
                            class="font-bold ml-auto text-xs shrink-0 flex items-center gap-1"
                        >
                            {conversation.user.data.country}
                            <span
                                class={`fi fi-${conversation.user.data.country.toLocaleLowerCase()}`}
                            >
                            </span>
                        </span>
                    {/if}
                </div>

                {@render unreaStatus(conversation.conversation_id!)}
            </button>
        </div>
    </li>
{/snippet}
{#snippet unreaStatus(id: number)}
    {#if chatStore.notifications.has(id)}
        <span
            class="w-4 h-4 rounded-full bg-red-600 animate-pulse text-[10px] flex items-center justify-center text-white ml-auto"
        >
            {chatStore.notifications.size}
        </span>
    {/if}
{/snippet}
