<script lang="ts">
    import { chatStore, type ChatEntry } from "$lib/store/store.svelte.js";
    import { untrack } from "svelte";
    import ChatHeader from "./ChatHeader.svelte";
    import ChatInput from "./ChatInput.svelte";
    import type { intersection } from "zod";

    let { data } = $props();

    $effect.pre(() => {
        const newItems = data.messages.items;
        const id = data.idValue;
        untrack(() => {
            const existing = chatStore.messages[id] ?? {};
            const updates = <Record<number, ChatEntry>>{};
            newItems.forEach((item: ChatEntry) => {
                updates[item.message.messageId] = item;
            });
            chatStore.messages[id] = { ...existing, ...updates };
        });
    });

    const renderList = $derived.by(()=>{
      chatStore.messages[data.idValue]
    })
    
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
    $inspect("messages", chatStore.messages);
</script>

<div id="chatbox" class="flex flex-col h-full">
    <ChatHeader partner={data.partner} />
    <div class="flex-1 overflow-y-auto min-h-0">
        <div class="bg-amber-400" use:interSectionObserver={loadOlder}>top</div>
        {#if chatStore.messages[data.idValue]}
            {#each Object.entries(chatStore.messages[data.idValue]) as [key, value] (key)}
                <div class="p-2">
                    <div id={key} class="bg-gray-200 p-2">
                        {value.message.content}
                    </div>
                </div>
            {/each}
        {/if}
        <div class="bg-amber-400" use:interSectionObserver={loadNewer}>
            bottom
        </div>
    </div>
    <ChatInput partner={data.partner} identifier={data.identifier} />
</div>
