import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "../$types";

export const load: LayoutServerLoad = async ({ fetch, cookies, locals }) => {
  await fetch("/api/auth/logout", { method: "POST" });

  cookies.delete("_Host-session", { path: "/" });

  locals.user = null;
  throw redirect(302, "/");
};
