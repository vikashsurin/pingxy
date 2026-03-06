import { SERVER_EVENTS } from "@pingxy/shared/constants/index";
import type { SocketHandler } from "./index";
import { blockManager } from "$lib/managers/entities/block.svelte";

export const blockHandler: SocketHandler = {
  [SERVER_EVENTS.BLOCKS.UNBLOCKED]: (data) => {
    blockManager.removeBlockedFromState(data.payload.blockedId);
  },
};
