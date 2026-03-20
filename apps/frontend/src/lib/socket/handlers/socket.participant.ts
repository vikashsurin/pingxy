import { SERVER_EVENTS } from "@pingxy/shared/constants/index";
import type { SocketHandler } from "./index";
import { participantManager } from "$lib/managers/entities/participant.svelte";

export const participantHandler: SocketHandler = {
    [SERVER_EVENTS.PARTICIPANTS.UPDATED]: (data) => {

        console.log("participant update received")
        console.log({ parupdate: data })
        participantManager.handleIncomingUpdate(data)
        // userManager.setOnlineUsers(data.payload.users);
    },

};
