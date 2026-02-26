<script lang="ts">
    import { chatStore } from "$lib/store/store.svelte";

    import {
        Camera,
        Image,
        Mic,
        Paperclip,
        Signature,
        Smile,
    } from "@lucide/svelte";

    let { identifier, partner } = $props();

    let messageText = $state("");

    let showAttachmentsPopup = $state(false);
    let showEmojiPopup = $state(false);

    async function handleSend() {
        console.log($state.snapshot(identifier));
        console.log($state.snapshot(partner));

        if (!identifier) {
            chatStore.errorMessage = "No identifier provided";
            return;
        }
        chatStore.sendMessage({ messageText, identifier, partner });
        messageText = "";
    }

    function handleInput() {
        // chatStore.handleTyping();
    }
</script>

<div class="flex relative gap-2 bg-white shrink-0 p-2 border-t border-gray-100">
    {#if chatStore.blockedUserIds.has(chatStore.activeConversation?.user.id!)}
        {@render blockedUserNotice()}
    {:else}
        <button
            onclick={() => (showAttachmentsPopup = !showAttachmentsPopup)}
            class="relative {showAttachmentsPopup
                ? 'bg-sky-100 text-sky-600'
                : ''} p-2 rounded-full"
        >
            <Paperclip />
        </button>
        <button
            onclick={() => (showEmojiPopup = !showEmojiPopup)}
            class="relative {showEmojiPopup
                ? 'bg-amber-200 text-amber-600'
                : ''} p-2 rounded-full"
        >
            <Smile />
        </button>
        <form action="">
            <input
                type="text"
                placeholder="Message"
                bind:value={messageText}
                class="flex-1 outline p-2 focus:outline-1 focus:outline-blue-500 rounded-md border border-gray-300"
                oninput={handleInput}
                onkeypress={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        messageText = messageText.trim();
                        handleSend();
                    }
                }}
            />
            <button
                class="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-4 py-2 rounded-md font-medium"
                onclick={handleSend}
            >
                Send
            </button>
        </form>

        {#if showAttachmentsPopup}
            {@render attachmentsPopup()}
        {/if}
        {#if showEmojiPopup}
            {@render emojiPopup()}
        {/if}
    {/if}
</div>

{#snippet blockedUserNotice()}
    <div
        class="bg-gray-700 w-full p-3 rounded text-gray-300 text-sm flex justify-between"
    >
        <p>User blocked, you cannot send messages!</p>
        <a
            href="/chat/settings/blocked"
            class="text-sm underline text-amber-600 hover:text-amber-400"
            >unblock here</a
        >
    </div>
{/snippet}

{#snippet attachmentsPopup()}
    <div class="absolute bottom-full left-0 w-max">
        <div
            class="bg-white p-2 rounded shadow-md border border-gray-200 flex flex-col gap-2"
        >
            <button class="p-2 hover:bg-gray-200 rounded">
                <Image />
            </button>
            <button class="p-2 hover:bg-gray-200 rounded">
                <Camera />
            </button>
            <button class="p-2 hover:bg-gray-200 rounded">
                <Mic />
            </button>
            <button class="p-2 hover:bg-gray-200 rounded">
                <Signature />
            </button>
        </div>
    </div>
{/snippet}

{#snippet emojiPopup()}
    <div class="absolute bottom-full mb-2 left-0 w-full">
        <div class="bg-white p-2 rounded shadow-md">
            <p class="text-sm text-gray-500">Emoji options go here</p>
        </div>
    </div>
{/snippet}
