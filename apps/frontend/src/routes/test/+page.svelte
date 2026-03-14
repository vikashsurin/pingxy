<script lang="ts">
  import { SvelteMap, SvelteSet } from "svelte/reactivity";

  const data = [
    { id: 1, msgId: 1, url: "#" },
    { id: 2, msgId: 1, url: "#" },
    { id: 3, msgId: 2, url: "#" },
    { id: 4, msgId: 2, url: "#" },
    { id: 5, msgId: 2, url: "#" },
    { id: 6, msgId: 2, url: "#" },
  ];

  const newAttachment = [{ id: 7, msgId: 2, url: "#" }];
  const single = { id: 7, msgId: 2, url: "#" };

  let entities = new SvelteMap<number, any>();

  let messageAttachmentMap = new SvelteMap<number, SvelteSet<number>>();

  function upsertAttachment(attachment: any) {
    // 1. check for existing
    const existing = entities.get(attachment.id);

    // 2. if not existing, add
    if (!existing) {
      entities.set(attachment.id, attachment);
    }

    // 3. update the messageAttachmentMap
    if (!messageAttachmentMap.has(attachment.msgId)) {
      messageAttachmentMap.set(attachment.msgId, new SvelteSet());
    }
    const idSet = messageAttachmentMap.get(attachment.msgId)!;
    idSet.add(attachment.id);
  }

  function setAttachments(items: any[]) {
    for (const item of items) {
      upsertAttachment(item);
    }
  }

  $effect(() => {
    console.log("entities", $state.snapshot(entities));
    console.log("messageAttachmentMap", $state.snapshot(messageAttachmentMap));
  });
</script>

<h1>Test</h1>

<button onclick={() => setAttachments(data)}>click</button>
<button onclick={() => setAttachments(newAttachment)}>single array</button>
<button onclick={() => upsertAttachment(single)}>single item</button>
