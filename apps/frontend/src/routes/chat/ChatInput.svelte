<script lang="ts">
  import { chatStore } from "$lib/store/store.svelte";

  let messageText = $state("");

  async function handleSend() {
    chatStore.sendMessage({ messageText });
    messageText = "";
  }

  function handleInput() {
    // chatStore.handleTyping();
  }
</script>

<div class="flex relative gap-2 bg-white shrink-0 p-2 border-t border-gray-100">
  {#if chatStore.blockedUserIds.has(chatStore.activeConversation?.user.id!)}
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
  {:else}
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
  {/if}
</div>


