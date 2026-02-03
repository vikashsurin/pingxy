
import { chatStore } from "$lib/store/store.svelte";
import type { ServerNewMessageType } from "@pingxy/shared/domain/message/index";

export async function handleNewMessage(data: ServerNewMessageType) {

  const { message, conversation_id, receipt } = data.payload;

  if (!chatStore.messages[conversation_id]) {
    chatStore.messages[conversation_id] = {};
  }
  chatStore.messages[conversation_id][message.message_id] = {
    message,
    receipt,

  }
}
