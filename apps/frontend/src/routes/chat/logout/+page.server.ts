import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "../$types";

export const load: LayoutServerLoad = async ({ fetch, request, cookies }) => {
  const cookie = request.headers.get("cookie");

  const response = await fetch(`/api/auth/logout`, {
    method: "POST",
    headers: {
      cookie: cookie as string,
    },
  });

  if (response.ok) {
    const data = await response.json();
    cookies.delete("_Host-session", {
      maxAge: 0,
      httpOnly: false,
      secure: false,
      path: "/",
      sameSite: "lax",
    });

    redirect(302, "/");
  }

  return { success: true };
};
