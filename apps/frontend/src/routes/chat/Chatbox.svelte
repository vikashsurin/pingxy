<script lang="ts">
  import ChatboxHeader from "./ChatboxHeader.svelte";
  import InfiniteScrollChat from "./InfiniteScrollChat.svelte";
  import ChatInput from "./ChatInput.svelte";
  import { chatStore } from "$lib/store/store.svelte";
  import { fly, fade, scale } from "svelte/transition";
  $effect(() => {
    if (chatStore.errorMessage) {
      const timer = setTimeout(() => {
        chatStore.errorMessage = "";
      }, 5000); // Hide after 5 seconds

      return () => clearTimeout(timer);
    }
  });
</script>

<div
  id="chatbox"
  class="col-span-8 border-5 border-green-500 min-h-0 relative flex flex-col overflow-hidden"
>
  <ChatboxHeader />

  <InfiniteScrollChat />

  {#if chatStore.errorMessage}
    <div
      in:fly={{ y: 20, duration: 200 }}
      out:fade={{ duration: 150 }}
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <p class="bg-amber-200 text-amber-900 py-3 px-4 rounded-md shadow-lg">
        {chatStore.errorMessage}
      </p>
    </div>
  {/if}
  <ChatInput />
</div>
