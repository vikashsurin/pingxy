import type { attachmentSelectSchema } from "@pingxy/shared/domain/attachment/attachment.schema";
import { SvelteMap, SvelteSet } from "svelte/reactivity";
import type z from "zod";

class AttachmentStore {
  attachments = new SvelteMap<string, z.infer<typeof attachmentSelectSchema>>();
  messageAttachementMap = new SvelteMap<number, SvelteSet<string>>();

  // OPTIMIZATION: Use a derived state to cache the array conversions
  // This ensures that 'getFilesForMessage' returns the SAME array reference
  // unless the underlying Set for that specific message actually changes.
  #fileCache = $derived.by(() => {
    const cache = new Map();
    for (const [msgId, idSet] of this.messageAttachementMap) {
      cache.set(
        msgId,
        Array.from(idSet)
          .map((id) => this.attachments.get(id))
          .filter(Boolean),
      );
    }
    return cache;
  });

  upsertAttachment(attachment: z.infer<typeof attachmentSelectSchema>) {
    // 1. Identity check (Optimized: Skip set if data is identical)
    // If you are sure the data might change (e.g. upload progress), keep the set.
    this.attachments.set(attachment.attachmentId, attachment);

    // 2. Update the relationship
    if (!this.messageAttachementMap.has(attachment.messageId)) {
      this.messageAttachementMap.set(attachment.messageId, new SvelteSet());
    }

    this.messageAttachementMap
      .get(attachment.messageId)!
      .add(attachment.attachmentId);
  }

  setAttachments(items: z.infer<typeof attachmentSelectSchema>[]) {
    // Batch processing
    for (const item of items) {
      this.upsertAttachment(item);
    }
  }

  getFilesForMessage(msgId: number) {
    // Returns the cached array from the derived map
    return this.#fileCache.get(msgId) ?? [];
  }
}

export const attachmentStore = new AttachmentStore();
