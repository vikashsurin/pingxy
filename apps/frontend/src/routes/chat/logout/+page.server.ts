import { redirect } from "@sveltejs/kit";
import { PUBLIC_API_URL } from "$env/static/public";

export async function load({ request, cookies }) {
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
}
