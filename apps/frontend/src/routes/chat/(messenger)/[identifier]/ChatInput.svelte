<script lang="ts">
  import { toast } from "$lib/components/toast/toast.svelte";
  import { messageManager } from "$lib/managers/entities/message.svelte";
  import { uxManager } from "$lib/managers/entities/ux.svelte";
  import { FileStore } from "$lib/stores/fileStore.svelte";
  import { messageStore } from "$lib/stores/messageStore.svelte";
  import { chatStore } from "$lib/stores/store.svelte";
  import { Paperclip, Smile, X } from "@lucide/svelte";
  import { tick } from "svelte";
  import Attachments from "./(attachments)/Attachments.svelte";
  import EmojiList from "./(attachments)/EmojiSelector.svelte";

  let { identifier, idValue, partner } = $props();

  const manager = new FileStore();

  let textInput = $state("");
  let messageInputRef = $state<HTMLTextAreaElement>();

  // 1. Attachment related states
  let showAttachmentsPopup = $state(false);

  let attachments = $derived(
    manager.files
      .filter((f) => f.status === "done" && f.serverData)
      .map((f) => f.serverData),
  );

  // 2. Emoji related states
  let showEmojiPopup = $state(false);

  async function handleSend() {
    if (!identifier) {
      chatStore.errorMessage = "No identifier provided";
      return;
    }

    const isUploading = manager.files.some((f) => f.status === "uploading");
    const hasFiles = manager.files.length > 0;
    const hasText = textInput.trim().length > 0;

    if (isUploading) {
      toast("Please wait for the file to upload", {
        type: "info",
        duration: 3000,
      });
      return;
    }

    if (!hasText && !hasFiles) {
      toast("Message cannot be empty", { type: "error", duration: 3000 });
    }

    try {
      await messageManager.sendMessage({
        messageText: textInput,
        identifier,
        partner,
        attachments: attachments ?? null,
      });

      textInput = "";
      manager.reset();
    } catch (error) {
      toast("Failed to send message", { type: "error", duration: 3000 });
    }
  }

  let typingThrottle: any;

  function handleInput() {
    if (typingThrottle) return;

    uxManager.emitTyping({ conversationId: idValue, userId: partner.id });

    typingThrottle = setTimeout(() => {
      typingThrottle = null;
    }, 2000);
  }

  async function handleSelectEmoji(emoji: string) {
    if (!messageInputRef) return;

    const start = messageInputRef.selectionStart ?? 0;
    const end = messageInputRef.selectionEnd ?? 0;

    textInput = textInput.slice(0, start) + emoji + textInput.slice(end);

    await tick();

    messageInputRef.focus();
    const newPos = start + emoji.length;
    messageInputRef.setSelectionRange(newPos, newPos);
  }
</script>

<div class="flex relative gap-2 bg-white shrink-0 p-2 border-t border-gray-100">
  {#if messageStore.chats.get(idValue)?.isTyping}
    <span
      class="text-xs bg-gray-100 text-gray-500 absolute py-0.5 px-2 rounded-t-sm bottom-full"
      >Typing...</span
    >
  {/if}

  <!-- use:clickOutside={() => (showAttachmentsPopup = false)} -->
  <!-- handle this TODO -->
  {#if false}
    {@render blockedUserNotice()}
  {:else}
    <button
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

    <form action="" class="flex relative flex-1 gap-2">
      <div id="thumbnails" class="flex flex-wrap absolute bottom-full my-1">
        {#each manager.files as file (file.id)}
          <div
            class="thumb group flex flex-col gap-2 items-center justify-center p-2 bg-gray-200 rounded m-1 border border-gray-300"
          >
            <img
              src={file.previewUrl}
              alt=""
              style:height="5em"
              style:width="auto"
            />
            <div class="flex flex-col gap-2 items-center text-xs">
              <div class="flex w-full items-center justify-between">
                <span>{file.progress}%</span>
                <span>{file.size}</span>
                <X
                  size={18}
                  class="hover:bg-gray-300 rounded p-0.5"
                  onclick={() => {
                    manager.removeFile(file.id);
                  }}
                />
              </div>

              <progress
                class="h-2 rounded bg-white w-30"
                value={file.progress}
                max="100"
              ></progress>
            </div>
          </div>
        {/each}
      </div>

      <textarea
        bind:this={messageInputRef}
        bind:value={textInput}
        class="flex flex-1 outline p-2 focus:outline-1 focus:outline-blue-500 rounded-md border border-gray-300"
        oninput={handleInput}
        onkeypress={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            textInput = textInput.trim();
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
    <Attachments {manager} />
  </div>
{/snippet}

{#snippet emojiPopup()}
  <div class="absolute bottom-full m-2 left-0 w-max">
    <div>
      <EmojiList onSelect={handleSelectEmoji} bind:showEmojiPopup />
    </div>
  </div>
{/snippet}
