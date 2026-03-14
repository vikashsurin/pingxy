<script lang="ts">
    import Emoji from "./Emoji.svelte";
    import { clickOutside } from "$lib/utils/clickOutside";

    let { onSelect, showEmojiPopup = $bindable() } = $props<{
        onSelect: (emoji: string) => void;
        showEmojiPopup: boolean;
    }>();

    type EmojiType = {
        hexcode: string;
        label: string;
        unicode: string;
    };

    let searchTerm = $state("");
    let allEmojis = $state<EmojiType[]>([]);
    let isLoading = $state(true);

    // Fetch emoji data on mount
    $effect(() => {
        fetch(
            "https://cdn.jsdelivr.net/npm/emojibase-data@latest/en/compact.json",
        )
            .then((res) => res.json())
            .then((data) => {
                allEmojis = data;
                isLoading = false;
            });
    });


    // Derived filtered list (Updates automatically when searchTerm or allEmojis changes)
    let filteredEmojis = $derived(
        allEmojis
            .filter((e) =>
                e.label.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .slice(0, 100),
    );
</script>

<div
    use:clickOutside={() => (showEmojiPopup = false)}
    class="emoji-picker border border-gray-200 w-64 rounded shadow-lg bg-white p-2"
>
    <input
        type="text"
        bind:value={searchTerm}
        placeholder="Search emojis..."
        class="w-full p-2 border-b mb-2 outline-none focus:border-blue-500"
    />

    <div class="grid grid-cols-6 gap-2 h-48 overflow-y-auto custom-scrollbar">
        {#if isLoading}
            <p class="col-span-6 text-center text-gray-400">Loading...</p>
        {:else}
            {#each filteredEmojis as { unicode, hexcode }}
                <button
                    onclick={() => onSelect(unicode)}
                    class="hover:bg-gray-100 p-1 rounded transition-colors"
                >
                    <Emoji char={unicode} hex={hexcode} size="1.25rem" />
                </button>
            {/each}
        {/if}
    </div>
</div>
