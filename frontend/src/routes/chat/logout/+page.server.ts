import { redirect } from "@sveltejs/kit";

export async function load({ request, cookies }) {
  const cookie = request.headers.get("cookie");

  const response = await fetch("http://backend:3000/api/chat/logout", {
    headers: {
      cookie: cookie as string,
    },
  });

  if (response.ok) {
    const data = await response.json();
    cookies.delete("sessionid", {
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
