<script lang="ts">
    import { enhance } from "$app/forms";
    import { userStore } from "$lib/stores/userStore.svelte.js";
    import { Loader, LucideUserStar } from "@lucide/svelte";
    import { blockedUserInfoSchema } from "@pingxy/shared";
    import { type SubmitFunction } from "@sveltejs/kit";
    import z from "zod";

    let { data, form } = $props();
    let showModalFor = $state<number>(-1);
    let isUnblocking = $state(false);
    let statusMessage = $state("");

    const handleUnblock: SubmitFunction = async () => {
        isUnblocking = true;
        statusMessage = "";

        return async ({ result, update }) => {
            await update();
            if (result.type === "success") {
                statusMessage = "User has been unblocked";
                // update the userStore state.
                const data = result.data as any;
                console.log("data from unblock", data);
                if (data.success && data.unblocked.blockedId) {
                    userStore.unblockUser(data.unblocked.blockedId);
                }
            }
            isUnblocking = false;
        };
    };
</script>

<div class="max-w-2xl mx-auto p-6">
    <div
        class="relative bg-white border text-sm border-gray-200 rounded-xl p-4 space-y-1"
    >
        <h2 class="text-lg font-semibold border-b">Manage Blocked users</h2>
        {#await data.blockedUsers}
            <div class="flex items-center justify-center">
                <Loader class="animate-spin" />
            </div>
        {:then blockedUsers: z.infer<typeof blockedUserInfoSchema>[]}
            {#if blockedUsers.length > 0}
                {#each blockedUsers as user (user.id)}
                    <div
                        class=" {showModalFor === user.id
                            ? 'border border-gray-200'
                            : ''} p-2 rounded-md"
                    >
                        <div class="flex justify-between items-center py-1">
                            <div class="px-2">{user.username}</div>

                            <button
                                class="px-2 py-1 border border-gray-300 rounded transition-colors text-xs hover:bg-amber-300 text-gray-400 hover:border-amber-600 hover:text-amber-800"
                                onclick={() => {
                                    if (showModalFor === user.id) {
                                        showModalFor = -1;
                                    } else {
                                        showModalFor = user.id;
                                    }
                                }}
                            >
                                Unblock
                            </button>
                        </div>
                        {#if showModalFor === user.id}
                            {@render confirmModal({
                                id: user.id,
                                name: user.username,
                                blockId: user.block.id,
                            })}
                        {/if}
                    </div>
                {/each}
            {:else}
                <div class="flex items-center justify-center">
                    <p class=" p-4 rounded text-sm">No blocked users</p>
                </div>
            {/if}
        {:catch error}
            <div class="flex items-center justify-center">
                <p>Something went wrong:{error.message}</p>
            </div>
        {/await}
    </div>
</div>

{#snippet confirmModal({
    id,
    name,
    blockId,
}: {
    id: number;
    name: string;
    blockId: number;
})}
    <div class="bg-gray-100 p-4 rounded mt-2">
        <h2 class="font-bold text-sm">Confirm?</h2>
        <p class="py-4">Are you sure to unblock <b>{name}?</b></p>
        <div class="flex justify-between gap-4 text-xs">
            <button
                class="border border-gray-300 hover:border-gray-400 px-2 py-1 rounded text-gray-600 bg-gray-200 hover:text-gray-900"
                onclick={() => (showModalFor = -1)}>No</button
            >
            <form method="POST" action="?/unblock" use:enhance={handleUnblock}>
                <input type="hidden" name="blockId" value={blockId} />
                <button
                    class=" px-2 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white"
                >
                    {isUnblocking ? "Unblocking..." : "Unblock"}
                </button>
            </form>
        </div>
    </div>
{/snippet}
