<script lang="ts">
  import { toast } from "$lib/components/toast/toast.svelte";
  import { sendMessage } from "$lib/store/managers/entities/message.svelte";
  import { emitTyping } from "$lib/store/managers/entities/ux.svelte";
  import { messageStore } from "$lib/store/messageStore.svelte";
  import { chatStore } from "$lib/store/store.svelte";
  import { clickOutside } from "$lib/utils/clickOutside";
  import {
    Camera,
    Image,
    Mic,
    Paperclip,
    Signature,
    Smile,
  } from "@lucide/svelte";
  import EmojiList from "./(attachments)/EmojiSelector.svelte";
  import { tick } from "svelte";

  let { identifier, idValue, partner } = $props();

  let inputValue = $state("");
  let messageInputRef = $state<HTMLTextAreaElement>();
  let showAttachmentsPopup = $state(false);
  let showEmojiPopup = $state(false);

  async function handleSend() {
    if (!identifier) {
      chatStore.errorMessage = "No identifier provided";
      return;
    }
    if (!inputValue) {
      toast("Message cannot be empty", { type: "error", duration: 3000 });
      return;
    }
    sendMessage({ messageText: inputValue, identifier, partner });

    inputValue = "";
  }

  let typingThrottle: any;

  function handleInput() {
    if (typingThrottle) return;

    emitTyping({ conversationId: idValue, userId: partner.id });

    typingThrottle = setTimeout(() => {
      typingThrottle = null;
    }, 2000);
  }

  async function handleSelectEmoji(emoji: string) {
    if (!messageInputRef) return;

    const start = messageInputRef.selectionStart ?? 0;
    const end = messageInputRef.selectionEnd ?? 0;

    inputValue = inputValue.slice(0, start) + emoji + inputValue.slice(end);

    await tick(); // waits for Svelte to flush DOM updates

    messageInputRef.focus();
    const newPos = start + emoji.length;
    messageInputRef.setSelectionRange(newPos, newPos);
  }

  function handleAddAttachment() {}
</script>

<div class="flex relative gap-2 bg-white shrink-0 p-2 border-t border-gray-100">
  {#if messageStore.chats.get(idValue)?.isTyping}
    <span
      class="text-xs bg-gray-100 text-gray-500 absolute py-0.5 px-2 rounded-t-sm bottom-full"
      >Typing...</span
    >
  {/if}

  <!-- handle this TODO -->
  {#if false}
    {@render blockedUserNotice()}
  {:else}
    <button
      use:clickOutside={() => (showAttachmentsPopup = false)}
      onclick={() => (showAttachmentsPopup = !showAttachmentsPopup)}
      class="relative hover:bg-gray-200 {showAttachmentsPopup
        ? 'bg-sky-100 text-sky-600'
        : ''} p-2 rounded-full"
    >
      <Paperclip />
    </button>
    <button
      onclick={() => (showEmojiPopup = !showEmojiPopup)}
      class="relative hover:bg-gray-200 {showEmojiPopup
        ? 'bg-amber-200 text-amber-600 '
        : ''} p-2 rounded-full"
    >
      <Smile />
    </button>

    <form action="" class="flex flex-1 gap-2">
      <textarea
        bind:this={messageInputRef}
        bind:value={inputValue}
        class="flex flex-1 outline p-2 focus:outline-1 focus:outline-blue-500 rounded-md border border-gray-300"
        oninput={handleInput}
        onkeypress={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            inputValue = inputValue.trim();
            handleSend();
          }
        }}
        placeholder="Message"
      ></textarea>

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
  <div class="absolute bottom-full left-0 w-max m-2">
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
  <div class="absolute bottom-full m-2 left-0 w-max">
    <div>
      <EmojiList onSelect={handleSelectEmoji} bind:showEmojiPopup />
    </div>
  </div>
{/snippet}
