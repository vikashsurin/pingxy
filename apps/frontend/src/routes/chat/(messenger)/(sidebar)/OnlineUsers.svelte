<script lang="ts">
    import { chatStore } from "$lib/store/store.svelte.js";
    import type { User } from "@pingxy/shared/domain/user/user.types";
    import GenderIcon from "../GenderIcon.svelte";

    let { searchQuery, gender } = $props();
    let sortedUsers = $derived.by(() => {
        const searchLower = searchQuery.trim().toLowerCase();
        return chatStore.visibleOnlineUsers
            .filter((data) => {
                if (gender !== "all" && data.data.gender !== gender)
                    return false;
                if (
                    searchLower &&
                    !data.username.toLowerCase().includes(searchLower)
                )
                    return false;
                return true;
            })
            .sort((a, b) => a.data.country.localeCompare(b.data.country));
    });

    function handleClick(user: User) {
        // chatStore.target = { isUser: true, user: user };
        // chatStore.initChat(user);

        chatStore.chatTarget = {
            isUser: true,
            type: "direct",
            displayName: user.username,
            partner: {
                id: user.id,
                username: user.username,
                gender: user.data.gender,
                age: user.data.age,
                country: user.data.country,
            },
        };
    }
</script>

<!-- USERS -->
<div class="bg-white flex flex-col overflow-hidden">
    <div class="flex flex-col overflow-hidden flex-1">
        <ul class="flex-1 overflow-y-auto">
            {#each sortedUsers as user}
                {@render userItemRow(user)}
            {/each}
        </ul>
    </div>
</div>

<!-- SNIPPETS-------------------------------- -->

{#snippet userItemRow(user: User)}
    <li>
        <a
            href="/chat/u_{user.id}"
            class="px-2 py-1 hover:bg-gray-300 relative flex w-full gap-1 border-gray-200 justify-between"
            id={user.id.toString()}
            onclick={() => handleClick(user)}
        >
            <div class="flex items-center gap-2">
                <GenderIcon gender={user.data.gender} />
                <span class="truncate">
                    {#if user.id === chatStore.currentUser?.id}
                        You
                    {:else}
                        {user.username}
                    {/if}
                </span>
            </div>
            {#if user.data.country && user.data.country !== "0"}
                <span
                    class="font-bold ml-auto text-xs shrink-0 flex items-center gap-1"
                >
                    {user.data.country}
                    <span
                        class={`fi fi-${user.data.country.toLocaleLowerCase()}`}
                    >
                    </span>
                </span>
            {/if}
        </a>
    </li>
{/snippet}
