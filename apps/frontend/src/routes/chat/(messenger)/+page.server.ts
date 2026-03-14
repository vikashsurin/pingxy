import { type Actions } from "@sveltejs/kit";
import { blockAction } from "$lib/actions/block";

export const actions: Actions = {
  block: blockAction,
};
