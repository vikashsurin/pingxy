import { conversationStore } from "$lib/stores/conversationStore.svelte";
import { SERVER_EVENTS } from "@pingxy/shared/constants/index";
import type { ServerEventMap } from "@pingxy/shared/socket/types";

const createParticipantManager = () => {

    const handleIncomingUpdate = (data: ServerEventMap[typeof SERVER_EVENTS.PARTICIPANTS.UPDATED]) => {
        // do something...

        const { id, lastReadMessageId, lastDeliveredMessageId, lastReadAt, lastDeliveredAt } = data.payload;

        conversationStore.pp.set(id, {
            lastReadMessageId,
            lastDeliveredMessageId,
            lastReadAt,
            lastDeliveredAt
        })

    }
    return {
        handleIncomingUpdate
    }
}

export const participantManager = createParticipantManager()