import { SERVER_EVENTS } from "@pingxy/shared/constants/index";
import type { SocketHandler } from "./index";
import * as uxManager from "../../store/managers/entities/ux.svelte";

export const uxHandler: SocketHandler = {
  [SERVER_EVENTS.TYPING.STARTED]: (data) => {
    uxManager.handleTypingEvent(data);
  },
};
