import { type Actions } from "@sveltejs/kit";
import { blockAction } from "./actions/block";

export const actions: Actions = {
  block: blockAction,
};
