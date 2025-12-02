import { redirect } from "@sveltejs/kit";

export async function load({ request, cookies }) {
  const cookie = request.headers.get("cookie");

  const response = await fetch("http://localhost:3000/chat/logout", {
    headers: {
      cookie: cookie as string,
    },
  });

  if (response.ok) {
    console.log("okay");
    const data = await response.json();
    console.log({ data });
    cookies.delete("sessionid", {
      maxAge: 0,
      httpOnly: false,
      secure: false,
      path: "/",
      sameSite: "lax",
    });

    redirect(302, "/login");
  }

  return { success: true };
}
