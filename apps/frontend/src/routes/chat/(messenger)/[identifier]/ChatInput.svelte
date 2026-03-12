<script lang="ts">
    import { toast } from "$lib/components/toast/toast.svelte";
    import { messageManager } from "$lib/managers/entities/message.svelte";
    import { uxManager } from "$lib/managers/entities/ux.svelte";
    import { fileStore } from "$lib/stores/fileStore.svelte";
    import { messageStore } from "$lib/stores/messageStore.svelte";
    import { chatStore } from "$lib/stores/store.svelte";
    import { Paperclip, Smile, X } from "@lucide/svelte";
    import type {
        attachmentInsertSchema,
        attachmentResponseSchema,
    } from "@pingxy/shared/domain/attachment/attachment.schema";
    import { tick } from "svelte";
    import z from "zod";
    import Attachment from "./(attachments)/Attachment.svelte";
    import AttachmentMenu from "./(attachments)/AttachmentMenu.svelte";
    import EmojiMenu from "./(attachments)/EmojiMenu.svelte";

    let { identifier, idValue, partner } = $props();

    let textInput = $state("");
    let messageInputRef = $state<HTMLTextAreaElement>();

    // 1. Attachment related states
    let showAttachmentsPopup = $state(false);

    let attachments = $derived<
        z.infer<z.ZodArray<typeof attachmentResponseSchema>>
    >(
        fileStore.files
            .filter((f) => f.status === "done" && f.serverData)
            .map(
                (f) => f.serverData as z.infer<typeof attachmentResponseSchema>,
            ),
    );

    $inspect({ attachments });

    // 2. Emoji related states
    let showEmojiPopup = $state(false);

    async function handleSend() {
        if (!identifier) {
            chatStore.errorMessage = "No identifier provided";
            return;
        }

        const isUploading = fileStore.files.some(
            (f) => f.status === "uploading",
        );
        const hasFiles = fileStore.files.length > 0;
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
                attachments: attachments,
            });

            textInput = "";
            fileStore.clear();
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
            {#if fileStore.files.length > 0}
                <div
                    class="p-2 bg-gray-100 shadow-sm absolute bottom-full my-2 rounded-md"
                >
                    <div
                        id="thumbnails"
                        class="grid grid-cols-3 justify-between max-h-96 gap-2 rounded-sm overflow-auto"
                    >
                        {#each fileStore.files as entry (entry.id)}
                            <Attachment
                                {entry}
                                callback={() => fileStore.remove(entry.id)}
                            />
                        {/each}
                    </div>
                    <button
                        class="text-xs ml-auto flex items-center mt-1 gap-2 bg-white border border-gray-300 px-2 py-1 rounded-sm hover:shadow-sm"
                        onclick={() => fileStore.clear()}
                    >
                        Clear all <X size={14} /></button
                    >
                </div>
            {/if}

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
        <AttachmentMenu bind:showAttachmentsPopup />
    </div>
{/snippet}

{#snippet emojiPopup()}
    <div class="absolute bottom-full m-2 left-0 w-max">
        <div>
            <EmojiMenu onSelect={handleSelectEmoji} bind:showEmojiPopup />
        </div>
    </div>
{/snippet}
