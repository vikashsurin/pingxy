<script lang="ts">
    import { messageStore } from "$lib/store/messageStore.svelte.js";
    import { chatStore } from "$lib/store/store.svelte.js";
    import { onMount } from "svelte";
    import ChatHeader from "./ChatHeader.svelte";
    import ChatInput from "./ChatInput.svelte";
    let { data } = $props();

    $effect(() => {
        if (data.messages.items) {
            messageStore.syncMessages({
                convId: data.idValue,
                items: data.messages.items,
            });
        }
    });
    console.count("Component Execution Count"); // Tracks how often the script logic runs
    $inspect({ conversations: messageStore.conversations });
    $inspect({ messageIndex: messageStore.messageIndex });

    const renderList = $derived.by(() => {
        chatStore.messages[data.idValue];
    });

    const interSectionObserver = (node: HTMLElement, callback: () => void) => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                callback();
            }
        }, {});

        observer.observe(node);
        return {
            destroy() {
                observer.disconnect();
            },
        };
    };

    function loadOlder() {
        console.log("loading older");
    }

    function loadNewer() {
        console.log("loading newer");
    }
</script>

<div id="chatbox" class="flex flex-col h-full">
    <ChatHeader partner={data.partner} />
    <div class="flex-1 overflow-y-auto min-h-0">
        <div class="bg-amber-400" use:interSectionObserver={loadOlder}>top</div>
        {#if messageStore.conversations[data.idValue]}
            {#each messageStore.conversations[data.idValue] as item}
                <div>
                    <p>{item.message.content}</p>
                </div>
            {/each}
        {/if}
        <div class="bg-amber-400" use:interSectionObserver={loadNewer}>
            bottom
        </div>
    </div>
    <ChatInput partner={data.partner} identifier={data.identifier} />
</div>
