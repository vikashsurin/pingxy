import { blockAction } from "$lib/actions/block.js";
import type { Actions } from "@sveltejs/kit";

export const load = async ({ params, fetch, locals }) => {
  const { identifier } = params;
  const idValue = Number(identifier.replace(/^[cug]_/, ""));
  const identifierType = identifier.startsWith("u_") ? "user" : "conversation";
  return {
    identifierType,
    identifier,
    idValue,
  };
};

export const actions: Actions = {
  block: blockAction,
};
