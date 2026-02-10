import { SERVER_EVENTS } from "@pingxy/shared/constants/index";
import type { SocketHandler } from "./index";

export const errorHandler: SocketHandler = {
    [SERVER_EVENTS.ERRORS.SYSTEM]: (data) => {
        console.error(data.payload);
    },
};