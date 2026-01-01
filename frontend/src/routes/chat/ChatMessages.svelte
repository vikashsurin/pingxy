<script lang="ts">
  import { onMount } from "svelte";
  import type {
    Message,
    User,
  } from "../../../../shared/src/lib/utils/validation.js";
  import { Check, CheckCheck } from "@lucide/svelte";
  import { chatStore } from "$lib/store.svelte";
  import { getSocket } from "$lib/socket.svelte";

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

  let previousMessageCount = 0;
  let activeChatId = $derived(chatStore.activeChatTarget?.uid);

  $effect(() => {
    if (!activeMessages) return;

    // SCENARIO 2: INCOMING MESSAGES WHILE CHAT IS OPEN
    if (activeMessages.length > previousMessageCount) {
      // Just update the previous count, no divider logic needed
    }
    previousMessageCount = activeMessages.length;
  });

  onMount(() => {
    scrollToBottom();
    if (!activeMessages) return;

    // SCENARIO 1: OPENING CHAT WITH UNREAD MESSAGES
    const currentUnreadCount = chatStore.unread.get(activeChatId!) ?? 0;

    if (currentUnreadCount > 0 && activeMessages.length > 0) {
      chatStore.unread.delete(activeChatId!);

      const socket = getSocket();
      const shouldSendObj = socket && socket.readyState === WebSocket.OPEN;

      // activeMessages.forEach((msg) => {
      //   if (msg.senderId === activeChatId && msg.status !== "read") {
      //     if (shouldSendObj) {
      //       socket.send(
      //         JSON.stringify({
      //           type: "read_receipt",
      //           messageId: msg.id,
      //           senderId: me.uid,
      //           recipientId: activeChatId!,
      //         })
      //       );
      //     }
      //     msg.status = "read";
      //   }
      // });
    }

    if (activeMessages) previousMessageCount = activeMessages.length;
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
          {message.content}
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
              {message.content}
            </span>
            <span
              class="text-xs text-gray-500 flex items-center gap-1 justify-end"
            >
              {new Date(message.timestamp).toLocaleTimeString()}
              {#if message.read}
                <CheckCheck size={14} class="text-blue-500" />
              {:else}
                <Check size={14} class="text-gray-400" />
              {/if}
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
              {message.content}
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
