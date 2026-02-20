import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, cookies, locals }) => {
  await fetch("/api/auth/logout", { method: "POST" });

  cookies.delete("_Host-session", { path: "/" });

  locals.user = null;


  throw redirect(302, "/login");
};
