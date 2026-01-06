import { redirect } from "@sveltejs/kit";

export async function load({ request, cookies }) {
  const cookie = request.headers.get("cookie");

  const response = await fetch("http://localhost:3000/api/auth/logout", {
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
