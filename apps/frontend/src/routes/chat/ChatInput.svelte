<script lang="ts">
    import { chatStore } from "$lib/store/store.svelte";
    import type { MessagePayload } from "@chat/shared/types";

    let messageText = $state("");

    async function handleSend() {
        chatStore.sendMessage({ messageText });
        messageText = "";
    }

    // doc link user flow of chat system
    // https://share.google/aimode/6c8iIjwWYWPJRNIGB
    function handleInput() {
        // chatStore.handleTyping();
    }
</script>

<div class="flex relative gap-2 bg-white shrink-0 p-2 border-t border-gray-100">
    <!-- {#if chatStore.activeChatTarget && chatStore.typingUsers.has(chatStore.activeChatTarget.uid)}
    <span class="absolute bottom-full px-2 text-xs text-gray-500"
      >Typing...</span
    >
  {/if} -->
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
</div>
