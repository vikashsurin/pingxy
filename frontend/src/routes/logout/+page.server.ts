import { redirect } from "@sveltejs/kit";

export async function load({ cookies }) {
  const response = await fetch("http://localhost:3000/logout", {
    credentials: "include",
  });

  if (response.ok) {
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
