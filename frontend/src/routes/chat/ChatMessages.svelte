<script lang="ts">
  import { onMount } from "svelte";
  import type { Message, User } from "../../../../shared/src";

  let {
    activeMessages,
    user: me,
  }: {
    activeMessages: Message[] | undefined;
    user: User;
  } = $props();

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
  <ul bind:this={messagesList} class=" overflow-y-auto w-full">
    {#each activeMessages as message}
      <li class="px-2 py-0.5">
        {#if message.senderName}
          <span class="inline-block font-bold mr-2"
            >{message.senderName} :
          </span>
        {/if}

        {#if message.kind === "system"}
          <p
            class="flex justify-between text-gray-400 mr-2 bg-gray-100 px-2 py-0.5 text-xs"
          >
            <span>
              {message.text}
            </span>
            <span>
              <!-- {new Date(message.timestamp).toLocaleString()} -->
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </p>
        {:else if message.kind === "chat"}
          <span>{message.text}</span>
        {/if}
      </li>
    {/each}
  </ul>
</div>
