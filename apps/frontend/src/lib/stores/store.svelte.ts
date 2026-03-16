import type {
  blockedUserInfoSchema,
  messageCreatedSchema,
} from "@pingxy/shared";
import type { Message, MessageReceipt, User } from "@pingxy/shared/types/index";
import { tick } from "svelte";
import { SvelteSet } from "svelte/reactivity";
import type z from "zod";
import { attachmentStore } from "./attachmentStore.svelte";
import { messageStore } from "./messageStore.svelte";
import { receiptStore } from "./receiptStore.svelte";
import { conversationStore } from "./conversationStore.svelte";

// export type ChatEntry = {
//   message: Message;
//   receipt: MessageReceipt;
// };

class ChatStore {
  private timer: ReturnType<typeof setTimeout> | null = null;
  isConnected = $state<boolean>(false);
  currentUser = $state<User | null | undefined>(undefined);
  errorMessage = $state<string>("");

  async setErrorMessage(msg: string) {
    // 1. Reset the logic
    if (this.timer) clearTimeout(this.timer);

    // 2. Clear the message briefly if it's the SAME error
    // to ensure the {#key} block sees a change
    if (this.errorMessage === msg) {
      this.errorMessage = "";
    }
    await tick();
    // 3. Set new message (wrapped in a tiny timeout if it was the same msg)
    setTimeout(() => {
      this.errorMessage = msg;

      // 4. Start fresh 5s countdown
      this.timer = setTimeout(() => {
        this.errorMessage = "";
        this.timer = null;
      }, 5000);
    }, 10);
  }

  get user() {
    return this.currentUser;
  }

  blockedUserIds = new SvelteSet<number>();

  blockedUsers = $state<z.infer<typeof blockedUserInfoSchema>[]>([]);

  // Maximum messages to keep in memory per conversation
  // private readonly MESSAGE_LIMIT = 100;
  readonly LIMIT = 20;

  upsertEntity(payload: z.infer<typeof messageCreatedSchema>["payload"]) {
    console.log({ payload });
    const { message, receipt, attachments } = payload;

    // messageStore.
    messageStore.upsertMessage(message);
    receiptStore.upsertReceipt(receipt);
    attachmentStore.setAttachments(attachments);
    conversationStore.upsertConversation(payload.conversation);
  }

  reset() {
    this.isConnected = false;
    this.currentUser = null;
  }
}

export const chatStore = new ChatStore();
