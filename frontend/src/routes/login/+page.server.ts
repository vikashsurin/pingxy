import { redirect } from "@sveltejs/kit";

export async function load({ cookies }) {
  const token = cookies.get("sessionid");

  if (token) {
    throw redirect(302, "/chat");
  }
  if (!token) return { success: false };

  return { success: true };
}

export const actions = {
  login: async ({ cookies, request }) => {
    const data = await request.formData();
    const username = data.get("username");

    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username }),
    });

    if (response.ok) {
      const { token } = await response.json();
      if (!token) return;

      cookies.set("sessionid", token, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: false,
        secure: false,
        path: "/",
        sameSite: "lax",
      });
    }
  },
};
