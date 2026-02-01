import type { ServerEventType } from "@pingxy/shared/ws";
import { chatStore } from "$lib/store/store.svelte";

export async function handleNewMessage(data: ServerEventType) {
  if (data.type === 'message.new') {
    const { message, conversation_id, receipt } = data.payload;

    if (!chatStore.messages[conversation_id]) {
      chatStore.messages[conversation_id] = {};
    }
    chatStore.messages[conversation_id][message.message_id] = {
      message,
      receipt,
    };
  }
}
