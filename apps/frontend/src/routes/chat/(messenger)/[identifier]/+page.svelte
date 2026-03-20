<script lang="ts">
  import { goto } from "$app/navigation";
  import { createMessageApi } from "$lib/api/message.api.js";
  import { receiptManager } from "$lib/managers/entities/receipt.svelte.js";
  import { uxManager } from "$lib/managers/entities/ux.svelte.js";
  import { attachmentStore } from "$lib/stores/attachmentStore.svelte.js";
  import { conversationStore } from "$lib/stores/conversationStore.svelte.js";
  import { fileStore } from "$lib/stores/fileStore.svelte.js";
  import { messageStore } from "$lib/stores/messageStore.svelte.js";
  import { receiptStore } from "$lib/stores/receiptStore.svelte.js";
  import LightBox from "./(attachments)/LightBox.svelte";
  import Chat from "./Chat.svelte";
  import ChatHeader from "./ChatHeader.svelte";
  import ChatInput from "./ChatInput.svelte";

  let { data } = $props();

  $inspect({ data });
  // $inspect({ attachements: attachmentStore.attachments });

  let showLightbox = $derived(fileStore.viewSelected);
  let newConversation = $state(false);
  let partnerId = $state<number>();
  let conversationId = $state<number>();

  $effect(() => {
    // check online status
    if (partnerId && conversationId) {
      uxManager.emitPresenceCheck(partnerId, conversationId);
    }
  });

  $effect(() => {
    let cancelled = false;
    const messageApi = createMessageApi();

    // 1. If UserType
    if (data.identifierType === "user") {
      partnerId = data.idValue;
      const cid = conversationStore.uc.get(partnerId);
      if (cid) {
        goto(`/chat/c_${cid}`, { replaceState: true });
        return;
      }
      newConversation = true;
    }

    // 2. If ConversationType
    if (data.identifierType === "conversation") {
      newConversation = false;
      messageStore.activeChatId = data.idValue;
      conversationId = data.idValue;

      partnerId = conversationStore.getPartnerId(data.idValue);

      messageApi
        .fetchMessages({ conversationId: data.idValue, limit: 20 })
        .then((res) => {
          if (!cancelled) {
            messageStore.setMessages(res.entities.messages);
            receiptStore.setReceipts(res.entities.receipts);
            attachmentStore.setAttachments(res.entities.attachments);
          }
        });
    }

    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    if (data.identifierType !== "conversation") return;
    const conversationId = data.idValue;
    receiptManager.updateAllReceiptsToRead({
      conversationId,
      senderId: partnerId!,
    });
  });
</script>

<div id="chatbox" class="flex flex-col h-full">
  {#if partnerId}
    <ChatHeader id={partnerId} cid={conversationId} />

    {#if newConversation}
      <div class="flex-1 flex min-h-0 items-center justify-center">
        <p class="px-3 py-2 bg-gray-300 rounded">start a conversation</p>
      </div>
    {:else}
      <Chat idValue={data.idValue} user={data.user} />
    {/if}

    <ChatInput
      {partnerId}
      idValue={data.idValue}
      identifier={data.identifier}
    />
  {/if}
</div>

<!-- 1. Preview image/file -->
{#if showLightbox}
  <LightBox />
{/if}

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
