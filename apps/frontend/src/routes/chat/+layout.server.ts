import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({
  fetch, // ✅ Add this
  request,
  cookies,
}) => {
  const token = cookies.get("_Host-session");

  if (!token) {
    throw redirect(302, "/");
  }

  const cookie = request.headers.get("cookie");

  // Use SvelteKit's fetch (handles relative URLs during SSR)
  const verifyResponse = await fetch("/api/auth/verify", {
    headers: { cookie: cookie as string },
  });

  const meResponse = await fetch("/api/auth/me", {
    headers: { cookie: cookie as string },
  });

  const { user } = await meResponse.json();

  if (!user) {
    cookies.delete("_Host-session", { path: "/" });
    throw redirect(302, "/");
  }

  return { success: true, user };
};
