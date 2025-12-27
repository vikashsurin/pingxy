<script lang="ts">
    import { chatStore } from "$lib/store.svelte";

    let message = $state("");

    function handleSend() {
        chatStore.sendMessage(message);
        message = "";
    }

    function handleInput() {
        chatStore.handleTyping();
    }
</script>

<div class="flex gap-2 bg-white shrink-0 p-2 border-t border-gray-100">
    <input
        type="text"
        placeholder="Message"
        bind:value={message}
        class="flex-1 outline p-2 focus:outline-1 focus:outline-blue-500 rounded-md border border-gray-300"
        oninput={handleInput}
        onkeypress={(e) => {
            if (e.key === "Enter") {
                e.preventDefault();
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
