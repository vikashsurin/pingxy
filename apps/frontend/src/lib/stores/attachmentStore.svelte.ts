import { SvelteMap } from "svelte/reactivity";

class AttachmentStore {
  attachments = new SvelteMap<number, any[]>([]);

  // TODO: fix for accuracy
  upsertAttachment(attachment: any) {
    // 1. Attachement is optional
    // it may or may not be present

    if (!attachment) return;
    let existing = this.attachments.get(attachment.messageId);
    if (existing) {
      existing.push(attachment);
    } else {
      this.attachments.set(attachment.messageId, [attachment]);
    }
  }

  setAttachments(items: any[]) {
    for (const item of items) {
      const mId = item?.messageId;
      const aId = item?.attachmentId;
      if (!mId || !aId) continue;

      let group = this.attachments.get(mId);

      if (!group) {
        // Create a fresh array for this message
        this.attachments.set(mId, [item]);
      } else {
        // Use a Map/Set lookup if your "group" is large,
        // but for small arrays (1-10 items), .some is actually okay.
        // To be truly elite, check if it exists before pushing:
        const exists = group.some((a) => a.attachmentId === aId);
        if (!exists) {
          group.push(item);
        }
      }
    }
  }
}

export const attachmentStore = new AttachmentStore();
