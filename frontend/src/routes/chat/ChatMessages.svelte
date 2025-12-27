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
      {@render MessageItem(message)}
    {/each}
  </ul>
</div>
{#snippet MessageItem(message: Message)}
  <li class="flex w-full mt-4">
    <!-- NOTIFICAION MESSAGE -->
    {#if message.kind === "system"}
      <p
        class="flex w-full justify-between gap-10 text-gray-400 mr-2 bg-gray-100 px-2 py-0.5 text-xs"
      >
        <span>
          {message.text}
        </span>
        <span>
          <!-- {new Date(message.timestamp).toLocaleString()} -->
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </p>

      <!-- CHAT MESSAGE -->
    {:else if message.kind === "chat"}
      <div class="flex w-full">
        {#if message.senderId === me.uid}
          <div
            class="flex flex-col rounded-l-lg bg-yellow-100 ml-auto py-2 px-3 max-w-4/5"
          >
            <span>
              {message.text}
            </span>
            <span class="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        {:else}
          <!-- USER NAME -->
          {#if message.senderName}
            <span
              class="text-nowrap font-bold mr-1 text-xs bg-gray-100 h-max py-1 px-2 rounded-l-lg"
              >{message.senderName} :
            </span>
          {/if}
          <div
            class="flex flex-col rounded-r-lg bg-gray-100 px-2 py-1 max-w-4/5"
          >
            <span>
              {message.text}
            </span>
            <span class="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        {/if}
      </div>
    {/if}
  </li>
{/snippet}
