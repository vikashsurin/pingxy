<script lang="ts">
    import type { PublicUser } from "@chat/shared/types";
    import { chatStore, type ChatEntry } from "$lib/store/store.svelte.js";
    import GenderIcon from "./GenderIcon.svelte";

    let { searchQuery, gender } = $props();

    let sortedUsers = $derived.by(() => {
        const searchLower = searchQuery.trim().toLowerCase();
        return chatStore.onlineUsers
            .filter((data) => {
                if (gender !== "all" && data.user.data.gender !== gender)
                    return false;
                if (
                    searchLower &&
                    !data.user.username.toLowerCase().includes(searchLower)
                )
                    return false;
                return true;
            })
            .sort((a, b) =>
                a.user.data.country.localeCompare(b.user.data.country),
            );
    });

    function initChat(item: {
        conversation_id: number | null;
        user: PublicUser;
    }) {
        chatStore.chatTarget.isUser = true;

        chatStore.activeConversation = item as {
            conversation_id: number;
            user: PublicUser;
        };
    }
</script>

<!-- USERS -->
<div class="bg-gray-100 min-w-75 flex flex-col overflow-hidden">
    <div class="flex flex-col overflow-hidden flex-1">
        <ul class="flex-1 overflow-y-auto">
            {#each sortedUsers as item (item.user.id)}
                {@render userItemRow(item)}
            {/each}
        </ul>
    </div>
</div>

<!-- SNIPPETS-------------------------------- -->

{#snippet userItemRow(item: {
    conversation_id: number | null;
    user: PublicUser;
})}
    <li>
        <div class="flex items-center gap-1 w-full relative group">
            <button
                class="px-2 py-1 w-full hover:bg-gray-300 relative flex gap-1 border-gray-200"
                id={item.user.id.toString()}
                onclick={() => initChat(item)}
            >
                <div class="flex items-center gap-2 w-full overflow-hidden">
                    <GenderIcon gender={item.user.data.gender} />
                    <span class="truncate">
                        {#if item.user.id === chatStore.currentUser?.id}
                            You
                        {:else}
                            {item.user.username}
                        {/if}
                    </span>

                    {#if item.user.data.country && item.user.data.country !== "0"}
                        <span
                            class="font-bold ml-auto text-xs shrink-0 flex items-center gap-1"
                        >
                            {item.user.data.country}
                            <span
                                class={`fi fi-${item.user.data.country.toLocaleLowerCase()}`}
                            >
                            </span>
                        </span>
                    {/if}
                </div>

                <!-- {@render unreaStatus(user.id!)} -->
            </button>
        </div>
    </li>
{/snippet}

<!-- {#snippet unreaStatus(id: string)}
  {#if (chatStore.unread.get(id!) ?? 0) > 0}
    <span
      class="w-4 h-4 rounded-full bg-red-600 animate-pulse text-[10px] flex items-center justify-center text-white ml-auto"
    >
      {chatStore.unread.get(id!) ?? 0}
    </span>
  {/if}
{/snippet} -->
