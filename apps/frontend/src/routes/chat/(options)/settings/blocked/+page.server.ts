import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { unblockAction } from "$lib/actions/block";

export const load: PageServerLoad = async ({ locals, fetch }) => {
  if (!locals.user) throw redirect(302, "/");

  const blockerId = locals.user.id;

  // Start the fetch, but don't 'await' the JSON parsing here
  // We return the promise to the frontend to enable streaming/loading states
  const responsePromise = fetch(
    `/api/blocks/blocker/${blockerId}/with-info`,
  ).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

  return {
    success: true,
    blockedUsers: responsePromise,
  };
};

export const actions: Actions = {
  unblock: unblockAction,
};
