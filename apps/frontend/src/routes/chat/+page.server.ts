import { type Actions } from "@sveltejs/kit";
import { blockAction } from "./actions/block";
import { sendMessage } from "$lib/store/managers/entities/message.svelte";

export const actions: Actions = {
  block: blockAction,
  // sendMessage: {},
};
