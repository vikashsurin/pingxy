<script lang="ts">
    import { enhance } from "$app/forms";
    import { chatStore } from "$lib/stores/store.svelte";
    import { userStore } from "$lib/stores/userStore.svelte";
    import { clickOutside } from "$lib/utils/clickOutside";
    import { EllipsisVertical } from "@lucide/svelte";
    import GenderIcon from "../GenderIcon.svelte";

    let { id }: { id: number } = $props();

    let partner = $derived(userStore.get(id));

    $effect(() => {
        if (!partner) userStore.fetchIfMissing(id);
    });

    const currentUser = $derived(chatStore.currentUser);
    let isBlocking = $state(false);

    let toggleMenu = $state(false);
</script>

<div class="flex relative bg-white py-1 px-2 shrink-0 text-sm">
    {#if !partner}
        <div>loading...</div>
    {:else}
        <div class="flex w-full items-center gap-2">
            <span> Chatting with : </span>

            <GenderIcon gender={partner?.gender} />
            <span class=" font-bold">
                {partner?.username}
                {partner?.id === currentUser?.id ? " (You)" : ""}
            </span>

            {#if partner?.country && partner?.country !== "0"}
                <span class={`fi fi-${partner?.country.toLocaleLowerCase()}`}
                ></span>
            {/if}

            <EllipsisVertical
                size={24}
                class="hover:bg-gray-200 active:bg-gray-400 {toggleMenu
                    ? 'bg-gray-300'
                    : ''} p-1 rounded-full ml-auto"
                onclick={() => (toggleMenu = !toggleMenu)}
            />
        </div>
    {/if}
    {#if toggleMenu}
        <div
            style="z-index: 999;"
            use:clickOutside={() => (toggleMenu = false)}
            class="absolute top-full right-0 bg-white py-1 border mt-1 border-gray-300 min-w-30"
        >
            {@render blockMenuItem()}
            {@render viewMenuItem()}
        </div>
    {/if}
</div>

{#snippet blockMenuItem()}
    <form
        action="?/block"
        method="POST"
        use:enhance={() => {
            isBlocking = true;

            return async ({ result, update }) => {
                await update();
                if (result.type === "success" && result.data) {
                    const data = result.data as any;
                    if (data.success && data.blocked?.blockedId) {
                        userStore.blockUser(data.blocked.blockedId);
                    }
                }
                isBlocking = false;
            };
        }}
    >
        <input type="hidden" name="userId" value={partner?.id} />
        <!-- <button
            class="flex items-center w-full gap-1.5 py-1 px-3 hover:bg-gray-200"
        > -->
        <!-- <Ban size={14} /> -->
        {#if isBlocking}
            {@render menuItem("Blocking...")}
        {:else if userStore.isBlocked(partner?.id!)}
            <button
                disabled
                class="flex items-center w-full gap-1.5 py-1 px-3 bg-gray-900 text-red-500"
            >
                <span>Blocked</span>
            </button>
        {:else}
            {@render menuItem("Block")}
        {/if}
        <!-- </button> -->
    </form>
{/snippet}

{#snippet viewMenuItem()}
    <button
        class="flex items-center w-full gap-1.5 py-1 px-3 hover:bg-gray-200"
    >
        <!-- <Eye size={14} /> -->
        <span>View</span>
    </button>
{/snippet}

{#snippet menuItem(text: string)}
    <button
        class="flex items-center w-full gap-1.5 py-1 px-3 hover:bg-gray-200"
    >
        <span>{text}</span>
    </button>
{/snippet}
