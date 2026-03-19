import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, cookies, locals }) => {
  await fetch("/api/auth/logout", { method: "POST" });

  cookies.delete("_Host-session", { path: "/" });

  locals.user = null;

  return { success: true };
};
