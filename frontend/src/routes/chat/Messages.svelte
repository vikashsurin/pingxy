<script lang="ts">
  import { onMount } from "svelte";

  let { activeMessages, activeSocket } = $props();
  let messagesList: HTMLUListElement;

  function scrollToBottom() {
    if (messagesList) {
      messagesList.scrollTop = messagesList.scrollHeight;
    }
  }

  $effect(() => {
    // Scroll to bottom whenever activeMessages changes
    activeMessages;
    setTimeout(() => scrollToBottom(), 0);
  });

  onMount(() => {
    scrollToBottom();
  });
</script>

<div class="flex-1 flex flex-col overflow-hidden">
  <div class="bg-gray-200 py-2 px-3 shrink-0">
    {#if activeSocket?.uid === "global"}
      <h2 class="font-bold">Global chat</h2>
    {:else}
      <h2>
        Private chat with
        <span class="font-bold">
          {activeSocket?.username}
        </span>
      </h2>
    {/if}
  </div>
  <ul
    bind:this={messagesList}
    class="flex-1 overflow-y-auto border border-gray-200 w-full"
  >
    {#each activeMessages as message}
      <li class="px-2 py-0.5">
        {#if message.senderName}
          <span class="inline-block font-bold mr-2"
            >{message.senderName} :
          </span>
        {/if}

        {#if message.kind === "system"}
          <p
            class="flex justify-between text-sm text-gray-600 italic mr-2 bg-gray-100 px-2 py-0.5"
          >
            <span>
              {message.text}
            </span>
            <span>
              {new Date(message.timestamp).toLocaleString()}
            </span>
          </p>
        {:else if message.kind === "chat"}
          <span>{message.text}</span>
        {/if}
      </li>
    {/each}
  </ul>
</div>
