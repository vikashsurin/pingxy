<script lang="ts">
    import { validateSocket } from "$lib/store/helpers.js";
    import { emitMarkAllRead } from "$lib/store/managers/entities/receipt.svelte.js";
    import { messageStore } from "$lib/store/messageStore.svelte.js";
    import Chat from "./Chat.svelte";
    import ChatHeader from "./ChatHeader.svelte";
    import ChatInput from "./ChatInput.svelte";

    let { data } = $props();

    $effect(() => {
        if (data.messages.items) {
            messageStore.setMessages(data.messages.items);
        }
        const chat = messageStore.chats.get(data.idValue);
        if (chat) chat.unreadCount = 0;
    });

    $effect(() => {
        if (!data.identifier.startsWith("c_")) return;

        const conversationId = data.idValue;

        const currentuserId = data.user.id;
        const senderId = data.partner.id;

        messageStore.activeChatId = conversationId;

        const socket = validateSocket();
        if (!socket) return;

        emitMarkAllRead({ conversationId, currentuserId, senderId }).catch(
            (err) => console.error("Failed to mark as read:", err),
        );
    });
</script>

<div id="chatbox" class="flex flex-col h-full">
    <ChatHeader partner={data.partner} />

    <Chat idValue={data.idValue} user={data.user} />

    <ChatInput partner={data.partner} identifier={data.identifier} />
</div>

<style>
    /* @import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Roboto+Slab:wght@100..900&display=swap");

  #chatbox {
    font-family: "Roboto Slab", serif;
    font-optical-sizing: auto;
    font-weight: 400;
    font-style: normal;
  }

  @import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&display=swap");

  #meta-data {
    font-family: "IBM Plex Sans", sans-serif;
    font-optical-sizing: auto;
    font-weight: 400;
    font-style: normal;
  } */
</style>
