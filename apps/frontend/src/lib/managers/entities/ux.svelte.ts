import { send } from "$lib/socket/socket.svelte";
import { conversationStore } from "$lib/stores/conversationStore.svelte";
import { chatStore } from "$lib/stores/store.svelte";
import {
  DOMAIN_EVENTS,
  SERVER_EVENTS,
  type ServerEventMap,
} from "@pingxy/shared";
import { createClientReq } from "../factory";

const createUxManager = () => {
  let heartbeatInterval: ReturnType<typeof setInterval> | undefined;

  const emitTyping = async ({
    conversationId,
    userId,
  }: {
    conversationId: number;
    userId: number;
  }) => {
    const payload = createClientReq(DOMAIN_EVENTS.TYPING.START, {
      conversationId: conversationId,
      userId: userId,
    });
    send(payload);
  }

  const handleTypingEvent = (
    data: ServerEventMap[typeof SERVER_EVENTS.TYPING.STARTED],
  ) => {
    const { conversationId, userId } = data.payload;
    const state = conversationStore.chatState.get(conversationId);

    // set typing state
    if (state) state.handleTyping();
  }

  const emitPresenceCheck = (userId: number, conversationId: number) => {
    const currentUser = chatStore.currentUser;

    if (!currentUser) return;

    const payload = createClientReq(DOMAIN_EVENTS.PRESENCE.ONLINE, {
      conversationId: conversationId,
      of: userId,
      for: currentUser.id,
    });

    send(payload);
  }

  const handlePresenceEvent = (
    data: ServerEventMap[typeof SERVER_EVENTS.PRESENCE.ONLINE],
  ) => {
    const { of, for: userId, conversationId, online } = data.payload;
    const state = conversationStore.chatState.get(conversationId);

    if (online && state) {
      state.setOnline();
    } else {
      if (state) state.setOffline();
    }
  }

  const emitHeartbeat = () => {

    const payload = createClientReq(DOMAIN_EVENTS.HEARTBEAT, {
      ping: true,
    });
    heartbeatInterval = setInterval(() => {
      send(payload);
    }, 30000)
  }

  const stopHeartBeat = () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
  }

  const handleHeartbeatEvent = (
    data: ServerEventMap[typeof SERVER_EVENTS.HEARTBEAT],
  ) => {

    // console.log('data', data)

    // const { userId } = data.payload;
    // const state = conversationStore.chatState.get();

    // create this function
    // if (state) state.handleHeartbeat();
  }

  return {
    emitTyping,
    handleTypingEvent,
    emitPresenceCheck,
    handlePresenceEvent,
    emitHeartbeat,
    handleHeartbeatEvent,
    stopHeartBeat
  }
};


export const uxManager = createUxManager();
