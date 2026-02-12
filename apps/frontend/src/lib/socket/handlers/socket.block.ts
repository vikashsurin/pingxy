import { SERVER_EVENTS } from "@pingxy/shared/constants/index";
import type { SocketHandler } from "./index";
import * as blockManager from '../../store/managers/entities/block.svelte'

export const blockHandler: SocketHandler = {
  [SERVER_EVENTS.BLOCKS.UNBLOCKED]: (data) => {
    console.log("Block unblocked:", data.payload);
    blockManager.removeBlockedFromState(data.payload.blockedId);
  },
};
