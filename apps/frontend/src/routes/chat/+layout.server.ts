import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, cookies, locals }) => {
  if (!locals.user) {
    throw redirect(302, "/");
  }
  return { success: true, user: locals.user };
};
